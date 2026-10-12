import { FileTreeNode } from '../types';

export const DEMO_FILE_TREE: FileTreeNode = {
  name: 'task-api',
  path: '',
  isDirectory: true,
  children: [
    {
      name: 'src',
      path: 'src',
      isDirectory: true,
      children: [
        {
          name: 'server.ts',
          path: 'src/server.ts',
          isDirectory: false,
          category: 'entry_point',
          inferenceMethod: 'path_pattern',
          language: 'typescript',
        },
        {
          name: 'app.ts',
          path: 'src/app.ts',
          isDirectory: false,
          category: 'entry_point',
          inferenceMethod: 'path_pattern',
          language: 'typescript',
        },
        {
          name: 'routes',
          path: 'src/routes',
          isDirectory: true,
          children: [
            {
              name: 'tasks.ts',
              path: 'src/routes/tasks.ts',
              isDirectory: false,
              category: 'route',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
            {
              name: 'health.ts',
              path: 'src/routes/health.ts',
              isDirectory: false,
              category: 'route',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
          ],
        },
        {
          name: 'models',
          path: 'src/models',
          isDirectory: true,
          children: [
            {
              name: 'task.ts',
              path: 'src/models/task.ts',
              isDirectory: false,
              category: 'model',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
          ],
        },
        {
          name: 'middleware',
          path: 'src/middleware',
          isDirectory: true,
          children: [
            {
              name: 'auth.ts',
              path: 'src/middleware/auth.ts',
              isDirectory: false,
              category: 'utility',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
            {
              name: 'error-handler.ts',
              path: 'src/middleware/error-handler.ts',
              isDirectory: false,
              category: 'utility',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
          ],
        },
        {
          name: 'utils',
          path: 'src/utils',
          isDirectory: true,
          children: [
            {
              name: 'logger.ts',
              path: 'src/utils/logger.ts',
              isDirectory: false,
              category: 'utility',
              inferenceMethod: 'path_pattern',
              language: 'typescript',
            },
          ],
        },
      ],
    },
    {
      name: 'tests',
      path: 'tests',
      isDirectory: true,
      children: [
        {
          name: 'tasks.test.ts',
          path: 'tests/tasks.test.ts',
          isDirectory: false,
          category: 'test',
          inferenceMethod: 'path_pattern',
          language: 'typescript',
        },
      ],
    },
    {
      name: 'package.json',
      path: 'package.json',
      isDirectory: false,
      category: 'config',
      inferenceMethod: 'path_pattern',
      language: 'json',
    },
    {
      name: 'tsconfig.json',
      path: 'tsconfig.json',
      isDirectory: false,
      category: 'config',
      inferenceMethod: 'path_pattern',
      language: 'json',
    },
    {
      name: 'README.md',
      path: 'README.md',
      isDirectory: false,
      category: 'unknown',
      inferenceMethod: 'path_pattern',
      language: 'markdown',
    },
  ],
};
