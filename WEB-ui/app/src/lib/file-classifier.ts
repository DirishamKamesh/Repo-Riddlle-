import { FileCategory, InferenceMethod } from '../types';

export interface ClassificationResult {
  category: FileCategory;
  inferenceMethod: InferenceMethod;
}

export function classifyFilePath(path: string): ClassificationResult {
  const normalized = path.toLowerCase().replace(/\\/g, '/');

  // Entry point patterns
  if (
    normalized.endsWith('index.ts') ||
    normalized.endsWith('index.js') ||
    normalized.endsWith('server.ts') ||
    normalized.endsWith('server.js') ||
    normalized.endsWith('main.ts') ||
    normalized.endsWith('main.js') ||
    normalized.endsWith('app.ts') ||
    normalized.endsWith('app.js')
  ) {
    return { category: 'entry_point', inferenceMethod: 'path_pattern' };
  }

  // Route patterns
  if (
    normalized.includes('/routes/') ||
    normalized.includes('/controllers/') ||
    normalized.includes('/api/') ||
    normalized.endsWith('.route.ts') ||
    normalized.endsWith('.route.js') ||
    normalized.endsWith('.controller.ts') ||
    normalized.endsWith('.controller.js')
  ) {
    return { category: 'route', inferenceMethod: 'path_pattern' };
  }

  // Model patterns
  if (
    normalized.includes('/models/') ||
    normalized.includes('/schemas/') ||
    normalized.includes('/entities/') ||
    normalized.endsWith('.model.ts') ||
    normalized.endsWith('.schema.ts') ||
    normalized.endsWith('.entity.ts')
  ) {
    return { category: 'model', inferenceMethod: 'path_pattern' };
  }

  // Component patterns
  if (
    normalized.includes('/components/') ||
    normalized.includes('/views/') ||
    normalized.endsWith('.tsx') ||
    normalized.endsWith('.jsx')
  ) {
    return { category: 'component', inferenceMethod: 'path_pattern' };
  }

  // Test patterns
  if (
    normalized.includes('__tests__') ||
    normalized.includes('/tests/') ||
    normalized.includes('/test/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.js') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.js')
  ) {
    return { category: 'test', inferenceMethod: 'path_pattern' };
  }

  // Config patterns
  if (
    normalized.includes('config') ||
    normalized.endsWith('.json') ||
    normalized.endsWith('.yaml') ||
    normalized.endsWith('.yml') ||
    normalized.endsWith('.env.example') ||
    normalized.endsWith('dockerfile')
  ) {
    return { category: 'config', inferenceMethod: 'path_pattern' };
  }

  // Utility patterns
  if (
    normalized.includes('/utils/') ||
    normalized.includes('/lib/') ||
    normalized.includes('/helpers/') ||
    normalized.includes('/services/')
  ) {
    return { category: 'utility', inferenceMethod: 'path_pattern' };
  }

  return { category: 'unknown', inferenceMethod: 'path_pattern' };
}
