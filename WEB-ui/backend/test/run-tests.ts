/**
 * RepoRiddle Backend Test & Verification Suite
 */
import assert from 'assert';
import { parseAndValidateGithubUrl } from '../src/services/github.js';
import {
  classifyFilePath,
  extractImportsFromSource,
  resolveImportTarget,
  buildFileTree,
  constructArchitectureGraph,
} from '../src/services/analyzer.js';
import { storage } from '../src/services/storage.js';
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

  // Suite 1: GitHub URL Validation
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

  // Suite 2: File Categorization Heuristics
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

  // Suite 3: AST Import Extraction
  console.log('\n[Suite 3] AST Import Extraction & Resolution');
  await test('Extracts ES6 static imports and CommonJS requires', () => {
    const sample = `
      import express from 'express';
      import { Router } from 'express';
      import { taskRouter } from './routes/tasks.js';
      const logger = require('./utils/logger');
      // import commented from './commented';
    `;
    const extracted = extractImportsFromSource(sample);
    const specifiers = extracted.map((e) => e.specifier);
    assert.ok(specifiers.includes('express'));
    assert.ok(specifiers.includes('./routes/tasks.js'));
    assert.ok(specifiers.includes('./utils/logger'));
    assert.ok(!specifiers.includes('./commented'));
  });

  await test('Resolves relative imports against real file paths', () => {
    const existing = new Set(['src/routes/tasks.ts', 'src/utils/logger.ts', 'src/server.ts']);
    const target = resolveImportTarget('src/server.ts', './routes/tasks', existing);
    assert.strictEqual(target, 'src/routes/tasks.ts');

    const external = resolveImportTarget('src/server.ts', 'express', existing);
    assert.strictEqual(external, null);
  });

  // Suite 4: Architecture Graph Construction
  console.log('\n[Suite 4] Architecture Graph Construction');
  await test('Constructs graph containing only verified static imports', () => {
    const files = [
      { path: 'src/server.ts', mode: '100644', type: 'blob' as const, sha: '1', url: '' },
      { path: 'src/routes/tasks.ts', mode: '100644', type: 'blob' as const, sha: '2', url: '' },
      { path: 'src/utils/logger.ts', mode: '100644', type: 'blob' as const, sha: '3', url: '' },
    ];
    const sourceContents = new Map([
      ['src/server.ts', "import { taskRouter } from './routes/tasks';\nimport { log } from './utils/logger';"],
      ['src/routes/tasks.ts', "import { log } from '../utils/logger';"],
      ['src/utils/logger.ts', 'export const log = () => {};'],
    ]);

    const graph = constructArchitectureGraph(files, sourceContents);
    assert.strictEqual(graph.nodeCount, 3);
    assert.strictEqual(graph.edgeCount, 3);
    assert.ok(graph.edges.every((e) => e.type === 'import' && e.confirmed === true));
  });

  // Suite 5: Tree Construction
  console.log('\n[Suite 5] Hierarchical Tree Construction');
  await test('Builds nested FileTreeNode from flat file list', () => {
    const files = [
      { path: 'src/index.ts', mode: '100644', type: 'blob' as const, sha: '1', url: '' },
      { path: 'src/routes/task.ts', mode: '100644', type: 'blob' as const, sha: '2', url: '' },
      { path: 'package.json', mode: '100644', type: 'blob' as const, sha: '3', url: '' },
    ];
    const tree = buildFileTree(files);
    assert.strictEqual(tree.name, 'root');
    assert.ok(tree.children?.some((c) => c.name === 'src' && c.isDirectory));
    assert.ok(tree.children?.some((c) => c.name === 'package.json' && !c.isDirectory));
  });

  // Suite 6: Grounded Missions Generation & Evaluation
  console.log('\n[Suite 6] Grounded Mission Generation & Answer Evaluation');
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

  // Suite 7: Storage & Sessions
  console.log('\n[Suite 7] Storage & In-Memory Session Management');
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
