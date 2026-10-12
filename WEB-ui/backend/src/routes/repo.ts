import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  parseAndValidateGithubUrl,
  ingestRepository,
  batchFetchSourceFiles,
} from '../services/github.js';
import {
  constructArchitectureGraph,
  buildFileTree,
} from '../services/analyzer.js';
import { generateRepositoryMissions } from '../services/gemini.js';
import { storage, AnalysisRecord } from '../services/storage.js';

export const repoRouter = Router();

const AnalyzeRequestSchema = z.object({
  url: z.string().min(1, 'GitHub URL is required'),
});

repoRouter.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid request body' });
      return;
    }

    const { url } = parseResult.data;
    const { owner, repo } = parseAndValidateGithubUrl(url);

    // Create unique analysisId
    const analysisId = `analysis-${owner}-${repo}`.toLowerCase();

    // Check if analysis already exists in storage for this repo
    const existing = await storage.getAnalysis(analysisId);
    if (existing && existing.status === 'complete') {
      res.json({
        analysisId: existing.id,
        repositoryId: existing.repositoryId,
        status: 'complete',
        cached: true,
      });
      return;
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
        commitSha: 'pending',
        stars: 0,
        fileCount: 0,
        detectedTechnologies: [],
      },
      status: 'connecting',
      stage: 'Connecting to GitHub',
      stageDetail: `Authenticating and reading metadata for ${owner}/${repo}...`,
      commitSha: '',
      graphData: { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 },
      fileTree: { name: repo, path: '', isDirectory: true, children: [] },
      missions: [],
      hintsUsed: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveAnalysis(initialRecord);

    // Respond immediately with pending status
    res.status(202).json({
      analysisId,
      repositoryId: initialRecord.repositoryId,
      status: 'connecting',
      cached: false,
    });

    // Execute ingestion asynchronously
    (async () => {
      try {
        await storage.updateAnalysisStatus(
          analysisId,
          'reading_tree',
          'Reading directory hierarchy',
          'Retrieving git tree structure from GitHub...'
        );

        const ingestion = await ingestRepository(owner, repo);
        const { repository, filteredFiles, files } = ingestion;

        await storage.updateAnalysisStatus(
          analysisId,
          'fetching_files',
          'Fetching source files',
          `Retrieving initial source batch (${Math.min(filteredFiles.length, 30)} files)...`
        );

        // Fetch top 35 files for initial AST analysis
        const targetPaths = filteredFiles.slice(0, 35).map((f) => f.path);
        const sourceMap = await batchFetchSourceFiles(
          owner,
          repo,
          repository.commitSha,
          targetPaths,
          5
        );

        await storage.updateAnalysisStatus(
          analysisId,
          'analyzing_imports',
          'Analyzing verified imports',
          'Parsing AST declarations and resolving relative import targets...'
        );

        const graphData = constructArchitectureGraph(filteredFiles, sourceMap);
        const fileTree = buildFileTree(files);

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
          stageDetail: 'Codebase architecture map and forensic missions ready.',
          commitSha: repository.commitSha,
          graphData,
          fileTree,
          missions,
          updatedAt: new Date().toISOString(),
        };

        await storage.saveAnalysis(completeRecord);
        console.log(`✅ Completed real analysis for ${owner}/${repo}: ${graphData.nodeCount} nodes, ${graphData.edgeCount} verified edges.`);
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
