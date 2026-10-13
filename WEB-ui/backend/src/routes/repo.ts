import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  parseAndValidateGithubUrl,
  ingestRepository,
  batchFetchSourceFiles,
  getLatestCommitSha,
} from '../services/github.js';
import {
  constructFullRepositoryAnalysis,
  classifyFilePath,
} from '../services/analyzer.js';
import { parseSourceAst } from '../services/ast-parser.js';
import {
  resolveModuleSpecifier,
  parseTsConfigFile,
} from '../services/resolver.js';
import { generateRepositoryMissions } from '../services/gemini.js';
import { storage, AnalysisRecord } from '../services/storage.js';

export const repoRouter = Router();

const AnalyzeRequestSchema = z.object({
  url: z.string().min(1, 'GitHub URL is required'),
});

const MAX_SOURCE_ANALYSIS_BUDGET = 100;

repoRouter.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid request body' });
      return;
    }

    const { url } = parseResult.data;
    const { owner, repo } = parseAndValidateGithubUrl(url);

    // Canonical analysisId for repository
    const analysisId = `analysis-${owner}-${repo}`.toLowerCase();

    // Check latest commit SHA on GitHub for commit-aware cache invalidation
    let latestSha: string | null = null;
    try {
      const branchInfo = await getLatestCommitSha(owner, repo);
      latestSha = branchInfo.commitSha;
    } catch (e: any) {
      console.warn(`⚠️ Could not pre-verify latest commit SHA for ${owner}/${repo}:`, e.message);
    }

    // Check existing analysis in storage
    const existing = await storage.getAnalysis(analysisId);
    if (existing && existing.status === 'complete') {
      // Re-use cached result ONLY if commit SHA matches (or if GitHub branch query failed)
      if (!latestSha || existing.commitSha === latestSha) {
        res.json({
          analysisId: existing.id,
          repositoryId: existing.repositoryId,
          status: 'complete',
          cached: true,
        });
        return;
      }
      console.log(`🔄 Commit SHA changed for ${owner}/${repo} (${existing.commitSha} -> ${latestSha}). Invalidating stale cache and re-analyzing...`);
    }

    // Initialize in-progress record
    const initialRecord: AnalysisRecord = {
      id: analysisId,
      repositoryId: `${owner}-${repo}`.toLowerCase(),
      repository: {
        id: `${owner}-${repo}`.toLowerCase(),
        owner,
        name: repo,
        fullName: `${owner}/${repo}`,
        description: 'Analyzing repository structure...',
        language: 'TypeScript',
        defaultBranch: 'main',
        commitSha: latestSha || 'pending',
        stars: 0,
        fileCount: 0,
        detectedTechnologies: [],
      },
      status: 'connecting',
      stage: 'Connecting to GitHub',
      stageDetail: `Authenticating and reading metadata for ${owner}/${repo}...`,
      commitSha: latestSha || '',
      graphData: { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 },
      fileTree: { name: repo, path: '', isDirectory: true, children: [] },
      missions: [],
      hintsUsed: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveAnalysis(initialRecord);

    // Respond immediately with 202 Accepted
    res.status(202).json({
      analysisId,
      repositoryId: initialRecord.repositoryId,
      status: 'connecting',
      cached: false,
    });

    // Execute ingestion and analysis asynchronously
    (async () => {
      try {
        await storage.updateAnalysisStatus(
          analysisId,
          'reading_tree',
          'Reading directory hierarchy',
          'Retrieving git tree structure from GitHub...'
        );

        const ingestion = await ingestRepository(owner, repo);
        const { repository, filteredFiles, files, isTruncated } = ingestion;
        const allRepoFiles = new Set(filteredFiles.map((f) => f.path));

        await storage.updateAnalysisStatus(
          analysisId,
          'fetching_files',
          'Fetching source files',
          `Prioritizing source batch (budget: ${MAX_SOURCE_ANALYSIS_BUDGET} files)...`
        );

        // --- Priority Pass 1: Core anchors & configs ---
        // Prioritize tsconfig.json, entry points, routes, models, and controllers
        const tsconfigItem = files.find((f) => f.path.toLowerCase() === 'tsconfig.json' || f.path.toLowerCase() === 'jsconfig.json');
        const prioritizedFiles = [...filteredFiles].sort((a, b) => {
          const aCat = classifyFilePath(a.path).category;
          const bCat = classifyFilePath(b.path).category;
          const priorityWeight = (cat: string) => {
            if (cat === 'entry_point') return 1;
            if (cat === 'route') return 2;
            if (cat === 'model') return 3;
            if (cat === 'config') return 4;
            if (cat === 'utility') return 5;
            return 6;
          };
          return priorityWeight(aCat) - priorityWeight(bCat);
        });

        const pass1Paths: string[] = [];
        if (tsconfigItem && !pass1Paths.includes(tsconfigItem.path)) {
          pass1Paths.push(tsconfigItem.path);
        }

        for (const file of prioritizedFiles) {
          if (pass1Paths.length >= 45) break;
          if (!pass1Paths.includes(file.path)) {
            pass1Paths.push(file.path);
          }
        }

        const sourceMap = await batchFetchSourceFiles(
          owner,
          repo,
          repository.commitSha,
          pass1Paths,
          5
        );

        // Parse tsconfig if fetched
        let rawTsConfig: string | undefined;
        if (tsconfigItem && sourceMap.has(tsconfigItem.path)) {
          rawTsConfig = sourceMap.get(tsconfigItem.path);
        }
        const tsconfigOpts = rawTsConfig ? parseTsConfigFile(rawTsConfig) : undefined;

        // --- Target-Driven Pass 2: Discover and fetch unresolved import targets ---
        const discoveredTargets = new Set<string>();
        for (const [filePath, content] of sourceMap.entries()) {
          const ast = parseSourceAst(filePath, content);
          for (const imp of ast.imports) {
            const target = resolveModuleSpecifier(filePath, imp.specifier, allRepoFiles, tsconfigOpts);
            if (target && !sourceMap.has(target)) {
              discoveredTargets.add(target);
            }
          }
        }

        // Fill remaining budget with discovered targets, followed by additional prioritized files
        const remainingBudget = Math.max(0, MAX_SOURCE_ANALYSIS_BUDGET - sourceMap.size);
        const pass2Paths: string[] = [];

        for (const target of discoveredTargets) {
          if (pass2Paths.length >= remainingBudget) break;
          if (!sourceMap.has(target)) {
            pass2Paths.push(target);
          }
        }

        if (pass2Paths.length < remainingBudget) {
          for (const file of prioritizedFiles) {
            if (pass2Paths.length >= remainingBudget) break;
            if (!sourceMap.has(file.path) && !pass2Paths.includes(file.path)) {
              pass2Paths.push(file.path);
            }
          }
        }

        if (pass2Paths.length > 0) {
          const pass2Map = await batchFetchSourceFiles(
            owner,
            repo,
            repository.commitSha,
            pass2Paths,
            5
          );
          for (const [k, v] of pass2Map.entries()) {
            sourceMap.set(k, v);
          }
        }

        await storage.updateAnalysisStatus(
          analysisId,
          'analyzing_imports',
          'Analyzing AST & Execution Flow',
          `Extracting AST imports and verifying execution pathways across ${sourceMap.size} modules...`
        );

        // Perform full static analysis: Dependency Graph + Evidence-backed Workflow Graph
        const { graphData, workflowGraph, fileTree } = constructFullRepositoryAnalysis(
          filteredFiles,
          sourceMap,
          isTruncated,
          rawTsConfig
        );

        await storage.updateAnalysisStatus(
          analysisId,
          'preparing_missions',
          'Preparing forensic missions',
          'Generating grounded engineering investigation objectives...'
        );

        const missions = await generateRepositoryMissions(
          repository,
          filteredFiles.map((f) => f.path),
          sourceMap
        );

        // Save final completed analysis
        const completeRecord: AnalysisRecord = {
          ...initialRecord,
          repository,
          status: 'complete',
          stage: 'Analysis Complete',
          stageDetail: `Analyzed ${graphData.coverage?.analyzedFiles || sourceMap.size} files, ${graphData.edgeCount} verified dependency edges, ${workflowGraph.edgeCount} workflow paths.`,
          commitSha: repository.commitSha,
          graphData,
          workflowGraph,
          fileTree,
          missions,
          updatedAt: new Date().toISOString(),
        };

        await storage.saveAnalysis(completeRecord);
        console.log(
          `✅ Completed analysis for ${owner}/${repo}@${repository.commitSha.slice(0, 7)}: ` +
          `${graphData.nodeCount} nodes, ${graphData.edgeCount} dependency edges, ` +
          `${workflowGraph.edgeCount} workflow paths.`
        );
      } catch (err: any) {
        console.error(`❌ Background analysis failed for ${owner}/${repo}:`, err);
        await storage.updateAnalysisStatus(
          analysisId,
          'failed',
          'Analysis Failed',
          err.message || 'Error occurred while ingesting repository'
        );
      }
    })();
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to process repository analysis' });
  }
});
