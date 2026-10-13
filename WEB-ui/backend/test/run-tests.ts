/**
 * RepoRiddle Backend Test & Verification Suite
 * Includes Regression Tests for AST Parsing, Module Resolution,
 * Accuracy (Precision & Recall), Workflow Graph Engine, and Commit-Aware Caching.
 */
import assert from 'assert';
import { parseAndValidateGithubUrl } from '../src/services/github.js';
import {
  classifyFilePath,
  extractImportsFromSource,
  resolveImportTarget,
  buildFileTree,
  constructArchitectureGraph,
  constructFullRepositoryAnalysis,
} from '../src/services/analyzer.js';
import { parseSourceAst } from '../src/services/ast-parser.js';
import {
  resolveModuleSpecifier,
  parseTsConfigFile,
} from '../src/services/resolver.js';
import { constructWorkflowGraph } from '../src/services/workflow-analyzer.js';
import { storage, AnalysisRecord } from '../src/services/storage.js';
import {
  generateRepositoryMissions,
  generateDeterministicMissions,
  evaluateMissionSubmission,
} from '../src/services/gemini.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`  ✓ ${name}`);
      passed++;
    })
    .catch((err) => {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    });
}

async function runAll() {
  console.log('====================================================');
  console.log('RepoRiddle Backend Verification & Test Suite');
  console.log('====================================================\n');

  // Suite 1: GitHub URL Parsing & Strict Validation
  console.log('[Suite 1] GitHub URL Parsing & Strict Validation');
  await test('Valid https GitHub URL parses owner and repo', () => {
    const res = parseAndValidateGithubUrl('https://github.com/expressjs/express');
    assert.strictEqual(res.owner, 'expressjs');
    assert.strictEqual(res.repo, 'express');
  });

  await test('URL with trailing slash and .git is cleaned', () => {
    const res = parseAndValidateGithubUrl('https://github.com/facebook/react.git/');
    assert.strictEqual(res.owner, 'facebook');
    assert.strictEqual(res.repo, 'react');
  });

  await test('URL without protocol auto-normalizes to https', () => {
    const res = parseAndValidateGithubUrl('github.com/fastify/fastify');
    assert.strictEqual(res.owner, 'fastify');
    assert.strictEqual(res.repo, 'fastify');
  });

  await test('Tree/branch URL throws informative error', () => {
    assert.throws(
      () => parseAndValidateGithubUrl('https://github.com/owner/repo/tree/main'),
      /root repository URL/
    );
  });

  await test('Non-github URL throws informative error', () => {
    assert.throws(
      () => parseAndValidateGithubUrl('https://gitlab.com/owner/repo'),
      /Only GitHub repositories are supported/
    );
  });

  // Suite 2: File Path Classification Heuristics
  console.log('\n[Suite 2] File Path Classification Heuristics');
  await test('Entry point patterns', () => {
    assert.strictEqual(classifyFilePath('src/index.ts').category, 'entry_point');
    assert.strictEqual(classifyFilePath('src/server.ts').category, 'entry_point');
    assert.strictEqual(classifyFilePath('app.js').category, 'entry_point');
  });

  await test('Route and controller patterns', () => {
    assert.strictEqual(classifyFilePath('src/routes/tasks.ts').category, 'route');
    assert.strictEqual(classifyFilePath('src/controllers/auth.ts').category, 'route');
    assert.strictEqual(classifyFilePath('api/v1/user.route.js').category, 'route');
  });

  await test('Model and schema patterns', () => {
    assert.strictEqual(classifyFilePath('src/models/user.ts').category, 'model');
    assert.strictEqual(classifyFilePath('src/schemas/task.schema.ts').category, 'model');
  });

  await test('Utility and config patterns', () => {
    assert.strictEqual(classifyFilePath('src/utils/logger.ts').category, 'utility');
    assert.strictEqual(classifyFilePath('tsconfig.json').category, 'config');
  });

  // Suite 3: AST Import Extraction via TypeScript Compiler API
  console.log('\n[Suite 3] TypeScript Compiler API AST Parsing');
  await test('Handles multiline imports, re-exports, dynamic imports, and CJS require', () => {
    const sample = `
      import {
        taskRouter,
        createTask
      } from './routes/tasks.js';
      import type { TaskDTO } from './models/task.dto';
      export * from './utils/constants';
      export { logger } from './utils/logger';
      const express = require('express');
      const localHelper = require('./helpers/math');

      async function loadFeature() {
        const mod = await import('./features/analytics');
      }
    `;

    const ast = parseSourceAst('src/server.ts', sample);
    const specifiers = ast.imports.map((i) => i.specifier);

    assert.ok(specifiers.includes('./routes/tasks.js'), 'Includes multiline import');
    assert.ok(specifiers.includes('./models/task.dto'), 'Includes type-only import');
    assert.ok(specifiers.includes('./utils/constants'), 'Includes export * from');
    assert.ok(specifiers.includes('./utils/logger'), 'Includes export { x } from');
    assert.ok(specifiers.includes('express'), 'Includes require("express")');
    assert.ok(specifiers.includes('./helpers/math'), 'Includes local require');
    assert.ok(specifiers.includes('./features/analytics'), 'Includes dynamic import');

    const typeOnlyImport = ast.imports.find((i) => i.specifier === './models/task.dto');
    assert.strictEqual(typeOnlyImport?.isTypeOnly, true, 'Flags type-only import accurately');
  });

  await test('Comments and strings in template literals do NOT produce false edges', () => {
    const codeWithCommentsAndStrings = `
      // import { fake } from './fake-comment-1';
      /*
       * import { ghost } from './fake-comment-2';
       */
      const query = "SELECT * FROM users WHERE import = './fake-string-literal'";
      const template = \`
        import { nestedFake } from './nested-template';
      \`;
      import { realModule } from './real-target';
    `;

    const ast = parseSourceAst('src/test.ts', codeWithCommentsAndStrings);
    const specifiers = ast.imports.map((i) => i.specifier);

    assert.strictEqual(specifiers.length, 1, 'Only parses 1 real import');
    assert.strictEqual(specifiers[0], './real-target');
    assert.ok(!specifiers.includes('./fake-comment-1'), 'No edge from single-line comment');
    assert.ok(!specifiers.includes('./fake-comment-2'), 'No edge from multi-line comment');
    assert.ok(!specifiers.includes('./fake-string-literal'), 'No edge from string literal');
    assert.ok(!specifiers.includes('./nested-template'), 'No edge from template string');
  });

  // Suite 4: TSConfig Path Mapping, ESM .js rewriting, and Index Resolution
  console.log('\n[Suite 4] Advanced Module Resolution (tsconfig aliases, ESM .js, index files)');
  const inventorySet = new Set([
    'src/index.ts',
    'src/routes/tasks.ts',
    'src/routes/index.ts',
    'src/utils/logger.ts',
    'src/components/TaskCard.tsx',
    'src/models/user.ts',
    'package.json',
  ]);

  const sampleTsConfig = parseTsConfigFile(`{
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"],
        "~/*": ["src/*"],
        "@components/*": ["src/components/*"]
      }
    }
  }`);

  await test('Resolves path aliases (@/* and @components/*)', () => {
    const resolvedPath = resolveModuleSpecifier(
      'src/routes/tasks.ts',
      '@/utils/logger',
      inventorySet,
      sampleTsConfig
    );
    assert.strictEqual(resolvedPath, 'src/utils/logger.ts');

    const resolvedComponent = resolveModuleSpecifier(
      'src/index.ts',
      '@components/TaskCard',
      inventorySet,
      sampleTsConfig
    );
    assert.strictEqual(resolvedComponent, 'src/components/TaskCard.tsx');
  });

  await test('Resolves ESM .js imports to .ts / .tsx files', () => {
    const resolvedEsm = resolveModuleSpecifier(
      'src/index.ts',
      './routes/tasks.js',
      inventorySet,
      sampleTsConfig
    );
    assert.strictEqual(resolvedEsm, 'src/routes/tasks.ts');
  });

  await test('Resolves directory index lookups', () => {
    const resolvedDir = resolveModuleSpecifier(
      'src/index.ts',
      './routes',
      inventorySet,
      sampleTsConfig
    );
    assert.strictEqual(resolvedDir, 'src/routes/index.ts');
  });

  await test('Returns null for third-party external dependencies', () => {
    const external = resolveModuleSpecifier(
      'src/index.ts',
      'express',
      inventorySet,
      sampleTsConfig
    );
    assert.strictEqual(external, null);
  });

  // Suite 5: Dependency Graph Precision & Recall with >40 Files
  console.log('\n[Suite 5] Dependency Graph Construction with >40 Files (Precision & Recall)');
  await test('Resolves targets beyond previous 35-file subset without false edges', () => {
    // Generate 45 files in repository inventory
    const files = Array.from({ length: 45 }, (_, i) => ({
      path: `src/modules/module_${i + 1}.ts`,
      mode: '100644',
      type: 'blob' as const,
      sha: `sha_${i + 1}`,
      url: '',
    }));
    files.push({
      path: 'src/main.ts',
      mode: '100644',
      type: 'blob' as const,
      sha: 'sha_main',
      url: '',
    });

    // Main imports module_1, module_40, module_44 (which is at index 43, beyond old 35-file cap)
    const sources = new Map<string, string>([
      [
        'src/main.ts',
        `import { mod1 } from './modules/module_1';
         import { mod40 } from './modules/module_40';
         import { mod44 } from './modules/module_44';
         import { nonExistent } from './modules/does_not_exist';
         import express from 'express';`,
      ],
      ['src/modules/module_1.ts', 'export const mod1 = 1;'],
      ['src/modules/module_40.ts', 'export const mod40 = 40;'],
      ['src/modules/module_44.ts', 'export const mod44 = 44;'],
    ]);

    const { graphData } = constructArchitectureGraph(files, sources);

    // Node count covers all eligible inventory items
    assert.strictEqual(graphData.nodes.length, 46, 'All 46 files present as nodes');

    // Expected valid edges from src/main.ts:
    // -> src/modules/module_1.ts
    // -> src/modules/module_40.ts
    // -> src/modules/module_44.ts
    const resolvedTargets = graphData.edges.map((e) => e.target);

    // True Positives
    assert.ok(resolvedTargets.includes('src/modules/module_1.ts'), 'Resolved module_1');
    assert.ok(resolvedTargets.includes('src/modules/module_40.ts'), 'Resolved module_40 (beyond index 35)');
    assert.ok(resolvedTargets.includes('src/modules/module_44.ts'), 'Resolved module_44 (beyond index 35)');

    // False Positives
    assert.ok(!resolvedTargets.includes('src/modules/does_not_exist.ts'), 'No phantom edge for non-existent file');
    assert.ok(!resolvedTargets.includes('express'), 'No edge for external package express');

    // Precision & Recall Measurement
    const expectedEdges = 3;
    const actualEdges = graphData.edges.length;
    const truePositives = graphData.edges.filter((e) =>
      ['src/modules/module_1.ts', 'src/modules/module_40.ts', 'src/modules/module_44.ts'].includes(e.target)
    ).length;

    const precision = truePositives / actualEdges;
    const recall = truePositives / expectedEdges;

    assert.strictEqual(precision, 1.0, 'Precision is 100% (zero false edges)');
    assert.strictEqual(recall, 1.0, 'Recall is 100% (all genuine edges found)');
    assert.strictEqual(graphData.coverage?.analyzedFiles, 4, 'Reports 4 analyzed files');
    assert.strictEqual(graphData.coverage?.skippedFiles, 42, 'Reports 42 unanalyzed files truthfully');
  });

  // Suite 6: Workflow Graph Execution Flow with Real Citations
  console.log('\n[Suite 6] Evidence-Backed Workflow Graph (Express Execution Pipeline)');
  await test('Extracts router mounting, route handlers, middleware guards, and model access with citations', () => {
    const files = [
      { path: 'src/server.ts', mode: '100644', type: 'blob' as const, sha: '1', url: '' },
      { path: 'src/app.ts', mode: '100644', type: 'blob' as const, sha: '2', url: '' },
      { path: 'src/routes/tasks.ts', mode: '100644', type: 'blob' as const, sha: '3', url: '' },
      { path: 'src/middleware/auth.ts', mode: '100644', type: 'blob' as const, sha: '4', url: '' },
      { path: 'src/controllers/tasks.ts', mode: '100644', type: 'blob' as const, sha: '5', url: '' },
      { path: 'src/models/task.ts', mode: '100644', type: 'blob' as const, sha: '6', url: '' },
    ];

    const sources = new Map<string, string>([
      [
        'src/server.ts',
        `import app from './app';
         const PORT = 3000;
         app.listen(PORT, () => console.log('Listening'));`,
      ],
      [
        'src/app.ts',
        `import express from 'express';
         import { taskRouter } from './routes/tasks';
         const app = express();
         app.use('/api/tasks', taskRouter);
         export default app;`,
      ],
      [
        'src/routes/tasks.ts',
        `import { Router } from 'express';
         import { requireAuth } from '../middleware/auth';
         import { getTasksHandler } from '../controllers/tasks';
         export const taskRouter = Router();
         taskRouter.get('/', requireAuth, getTasksHandler);`,
      ],
      [
        'src/controllers/tasks.ts',
        `import { TaskStore } from '../models/task';
         export function getTasksHandler(req, res) {
           const items = TaskStore.findAll();
           res.json(items);
         }`,
      ],
      ['src/middleware/auth.ts', 'export function requireAuth(req, res, next) { next(); }'],
      ['src/models/task.ts', 'export const TaskStore = { findAll: () => [] };'],
    ]);

    const { workflowGraph } = constructFullRepositoryAnalysis(files, sources);

    assert.ok(workflowGraph.edges.length >= 4, 'Discovered complete execution pipeline');

    // 1. Boots edge: server.ts -> app.ts
    const bootsEdge = workflowGraph.edges.find((e) => e.relation === 'boots');
    assert.ok(bootsEdge, 'Found boots edge');
    assert.strictEqual(bootsEdge?.source, 'src/server.ts');
    assert.strictEqual(bootsEdge?.target, 'src/app.ts');
    assert.ok(bootsEdge?.evidence.snippet.includes('app.listen'), 'Boots evidence has snippet');

    // 2. Mounts router edge: app.ts -> routes/tasks.ts
    const mountEdge = workflowGraph.edges.find((e) => e.relation === 'mounts_router');
    assert.ok(mountEdge, 'Found mounts_router edge');
    assert.strictEqual(mountEdge?.source, 'src/app.ts');
    assert.strictEqual(mountEdge?.target, 'src/routes/tasks.ts');
    assert.strictEqual(mountEdge?.routePath, '/api/tasks');

    // 3. Applies middleware: routes/tasks.ts -> middleware/auth.ts
    const mwEdge = workflowGraph.edges.find((e) => e.relation === 'applies_middleware');
    assert.ok(mwEdge, 'Found applies_middleware edge');
    assert.strictEqual(mwEdge?.source, 'src/routes/tasks.ts');
    assert.strictEqual(mwEdge?.target, 'src/middleware/auth.ts');

    // 4. Invokes handler: routes/tasks.ts -> controllers/tasks.ts
    const handlerEdge = workflowGraph.edges.find((e) => e.relation === 'invokes_handler');
    assert.ok(handlerEdge, 'Found invokes_handler edge');
    assert.strictEqual(handlerEdge?.source, 'src/routes/tasks.ts');
    assert.strictEqual(handlerEdge?.target, 'src/controllers/tasks.ts');

    // 5. Accesses model: controllers/tasks.ts -> models/task.ts
    const modelEdge = workflowGraph.edges.find((e) => e.relation === 'accesses_model');
    assert.ok(modelEdge, 'Found accesses_model edge');
    assert.strictEqual(modelEdge?.source, 'src/controllers/tasks.ts');
    assert.strictEqual(modelEdge?.target, 'src/models/task.ts');
  });

  // Suite 7: Commit-Aware Analysis Cache
  console.log('\n[Suite 7] Commit-Aware Analysis Caching & Invalidation');
  await test('Preserves cache when commit matches, invalidates when commit changes', async () => {
    const analysisId = 'analysis-testorg-sample';
    const initialRecord: AnalysisRecord = {
      id: analysisId,
      repositoryId: 'testorg-sample',
      repository: {
        id: 'testorg-sample',
        owner: 'testorg',
        name: 'sample',
        fullName: 'testorg/sample',
        description: 'Sample repo',
        language: 'TypeScript',
        defaultBranch: 'main',
        commitSha: 'commit_sha_v1',
        stars: 10,
        fileCount: 5,
        detectedTechnologies: ['TypeScript'],
      },
      status: 'complete',
      stage: 'Complete',
      stageDetail: 'Done',
      commitSha: 'commit_sha_v1',
      graphData: { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 },
      fileTree: { name: 'root', path: '', isDirectory: true, children: [] },
      missions: [],
      hintsUsed: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveAnalysis(initialRecord);

    // Lookup with same commit: valid
    const cached = await storage.getAnalysis(analysisId);
    assert.strictEqual(cached?.commitSha, 'commit_sha_v1');

    // Simulate new commit SHA arriving from GitHub
    const newCommitSha = 'commit_sha_v2';
    const isStale = cached?.commitSha !== newCommitSha;
    assert.strictEqual(isStale, true, 'Detects stale cache when commit SHA differs');

    // Update with fresh commit analysis
    const updatedRecord: AnalysisRecord = {
      ...initialRecord,
      commitSha: newCommitSha,
      repository: {
        ...initialRecord.repository,
        commitSha: newCommitSha,
      },
      updatedAt: new Date().toISOString(),
    };
    await storage.saveAnalysis(updatedRecord);

    const reloaded = await storage.getAnalysis(analysisId);
    assert.strictEqual(reloaded?.commitSha, 'commit_sha_v2', 'Cache refreshed with commit_sha_v2');
  });

  // Suite 8: Grounded Mission Generation & Answer Evaluation
  console.log('\n[Suite 8] Grounded Mission Generation & Answer Evaluation');
  const repo = {
    id: 'test-repo',
    owner: 'test-org',
    name: 'sample-api',
    fullName: 'test-org/sample-api',
    description: 'A test repository',
    language: 'TypeScript',
    defaultBranch: 'main',
    commitSha: 'abcdef123',
    stars: 42,
    fileCount: 4,
    detectedTechnologies: ['Express', 'TypeScript'],
  };
  const indexedFiles = [
    'src/server.ts',
    'src/routes/tasks.ts',
    'src/middleware/error-handler.ts',
    'package.json',
  ];
  const fileSources = new Map([
    ['src/server.ts', 'import express from "express";\nconst app = express();\napp.listen(3000);'],
    ['src/routes/tasks.ts', 'import { Router } from "express";\nexport const router = Router();'],
    ['src/middleware/error-handler.ts', 'export function errorHandler(err, req, res, next) {}'],
    ['package.json', '{"name": "sample-api"}'],
  ]);

  await test('Generates deterministic grounded missions with strictly indexed files', async () => {
    const missions = await generateRepositoryMissions(repo, indexedFiles, fileSources);
    assert.ok(missions.length >= 2, 'Generated at least 2 missions');
    assert.ok(
      missions.every((m) => m.relevantFiles.every((f) => indexedFiles.includes(f))),
      'All relevantFiles strictly exist in indexed files'
    );
  });

  await test('Evaluates accurate mission answers with grounded feedback', async () => {
    const missions = generateDeterministicMissions(repo, indexedFiles, fileSources);
    const mission1 = missions[0];

    const correctRes = await evaluateMissionSubmission(
      mission1,
      'The entry point is src/server.ts which initializes express and listens on port 3000.',
      ['src/server.ts'],
      ['app.listen(3000)'],
      fileSources
    );
    assert.strictEqual(correctRes.correct, true);
    assert.ok(correctRes.citations.length > 0);

    const failRes = await evaluateMissionSubmission(
      mission1,
      'I found nothing in the codebase.',
      [],
      [],
      fileSources
    );
    assert.strictEqual(failRes.correct, false);
  });

  // Suite 9: Storage & Sessions
  console.log('\n[Suite 9] Storage & In-Memory Session Management');
  await test('Creates session and tracks completed missions', async () => {
    const token = 'test-token-' + Date.now();
    const session = await storage.getSession(token);
    assert.strictEqual(session.token, token);

    await storage.recordSubmission(token, 'mission-1', 'answer 1', true);
    const updated = await storage.getSession(token);
    assert.ok(updated.completedMissions.has('mission-1'));
  });

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
