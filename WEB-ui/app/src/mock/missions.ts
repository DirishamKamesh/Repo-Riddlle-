import { MissionDetail, MissionSummary, MissionFeedback } from '../types';

export const DEMO_MISSIONS: MissionDetail[] = [
  {
    id: 'mission-1',
    type: 'entry_point',
    objective: 'Identify the primary bootstrap file that starts the HTTP server and binds to the network port.',
    startingClue: 'Look for files in the src/ directory that import http listeners or call app.listen().',
    hints: [
      'Check the root of src/ for a server or index file.',
      'server.ts starts the HTTP listener and loads environment variables.',
      'Compare server.ts and app.ts — one creates the Express app, the other calls listen().',
    ],
    relevantFiles: ['src/server.ts', 'src/app.ts'],
    status: 'active',
  },
  {
    id: 'mission-2',
    type: 'route_location',
    objective: 'Locate where the task creation endpoint is registered and which data model validates incoming task payloads.',
    startingClue: 'Explore the routes/ directory to find POST /api/tasks and trace its dependencies.',
    hints: [
      'Inspect src/routes/tasks.ts for router.post("/tasks", ...).',
      'Look at the imports at the top of tasks.ts to see what handles validation.',
      'models/task.ts defines the TaskSchema used to parse request bodies.',
    ],
    relevantFiles: ['src/routes/tasks.ts', 'src/models/task.ts'],
    status: 'available',
  },
  {
    id: 'mission-3',
    type: 'error_handling',
    objective: 'Pinpoint the global error handling middleware and verify how uncaught exceptions are formatted.',
    startingClue: 'Express uses four-argument middleware (err, req, res, next) for centralized error catching.',
    hints: [
      'Look in src/middleware/ for an error handler file.',
      'error-handler.ts catches all errors and returns standardized JSON with status codes.',
      'Check app.ts to verify that errorHandler is mounted after all routes.',
    ],
    relevantFiles: ['src/middleware/error-handler.ts', 'src/app.ts'],
    status: 'locked',
  },
];

export const DEMO_MISSION_SUMMARIES: MissionSummary[] = [
  {
    id: 'mission-1',
    type: 'entry_point',
    objective: 'Identify the primary bootstrap file that starts the HTTP server.',
    status: 'active',
    order: 1,
  },
  {
    id: 'mission-2',
    type: 'route_location',
    objective: 'Locate where task creation is handled and validated.',
    status: 'available',
    order: 2,
  },
  {
    id: 'mission-3',
    type: 'error_handling',
    objective: 'Pinpoint the centralized error handling middleware.',
    status: 'locked',
    order: 3,
  },
];

export interface MissionEvaluationRule {
  evaluate: (answer: string, evidenceFiles: string[]) => MissionFeedback;
}

export const MISSION_EVALUATION_RULES: Record<string, MissionEvaluationRule> = {
  'mission-1': {
    evaluate: (answer: string, evidenceFiles: string[]) => {
      const lower = answer.toLowerCase();
      const hasServer = lower.includes('server.ts') || lower.includes('server') || evidenceFiles.includes('src/server.ts');
      const hasApp = lower.includes('app.ts') || lower.includes('app') || evidenceFiles.includes('src/app.ts');

      if (hasServer) {
        return {
          correct: true,
          partial: false,
          feedback: 'Accurate deduction! src/server.ts is the main process entry point.',
          explanation:
            'src/server.ts imports the Express application from src/app.ts, reads the PORT environment variable, and invokes server.listen(). It also attaches SIGTERM and SIGINT listeners for graceful shutdown.',
          citations: [
            {
              id: 'c-1',
              file: 'src/server.ts',
              lineStart: 12,
              lineEnd: 18,
              snippet: 'const server = app.listen(PORT, () => {\n  logger.info(`Server listening on http://localhost:${PORT}`);\n});',
              reason: 'HTTP listener binding',
            },
          ],
        };
      }

      if (hasApp) {
        return {
          correct: false,
          partial: true,
          feedback: 'Partially correct: src/app.ts configures Express, but is not the startup bootstrap.',
          explanation:
            'src/app.ts creates the Express application factory and mounts middleware/routes, but does not bind to the network port. Notice that src/server.ts imports app and calls app.listen(PORT).',
          citations: [
            {
              id: 'c-app',
              file: 'src/app.ts',
              lineStart: 1,
              lineEnd: 6,
              snippet: 'export const app = express();',
              reason: 'Express application factory definition',
            },
          ],
        };
      }

      return {
        correct: false,
        partial: false,
        feedback: 'Incorrect entry point identification.',
        explanation:
          'Examine the root of the src/ directory. Look for the file that initializes http listeners or calls app.listen() with process signal handlers.',
        citations: [],
      };
    },
  },

  'mission-2': {
    evaluate: (answer: string, evidenceFiles: string[]) => {
      const lower = answer.toLowerCase();
      const hasRoute = lower.includes('tasks.ts') || lower.includes('routes/tasks') || evidenceFiles.includes('src/routes/tasks.ts');
      const hasModel = lower.includes('task.ts') || lower.includes('models/task') || lower.includes('taskschema') || lower.includes('zod') || evidenceFiles.includes('src/models/task.ts');

      if (hasRoute && hasModel) {
        return {
          correct: true,
          partial: false,
          feedback: 'Outstanding forensic trace! Both route registration and data model validation verified.',
          explanation:
            'src/routes/tasks.ts registers the POST / endpoint, while src/models/task.ts defines the TaskSchema (Zod model) that validates incoming request bodies before calling TaskStore.create().',
          citations: [
            {
              id: 'c-2-route',
              file: 'src/routes/tasks.ts',
              lineStart: 21,
              lineEnd: 27,
              snippet: 'const validated = TaskSchema.parse(req.body);\nconst created = await TaskStore.create(validated);',
              reason: 'Payload validation and creation invocation',
            },
          ],
        };
      }

      if (hasRoute && !hasModel) {
        return {
          correct: false,
          partial: true,
          feedback: 'Partially correct: You identified src/routes/tasks.ts, but missed the data validation model.',
          explanation:
            'While tasksRouter handles the HTTP POST request, inspect the imports at the top of tasks.ts to identify the Zod schema in src/models/task.ts that validates incoming task fields.',
          citations: [
            {
              id: 'c-2-model-hint',
              file: 'src/routes/tasks.ts',
              lineStart: 2,
              lineEnd: 2,
              snippet: 'import { TaskStore, TaskSchema } from "../models/task";',
              reason: 'Import of TaskSchema validator',
            },
          ],
        };
      }

      if (!hasRoute && hasModel) {
        return {
          correct: false,
          partial: true,
          feedback: 'Partially correct: You found the TaskSchema model, but did not pinpoint the route registration.',
          explanation:
            'src/models/task.ts defines the schema, but the HTTP endpoint receiving POST /api/tasks is located inside src/routes/tasks.ts.',
          citations: [],
        };
      }

      return {
        correct: false,
        partial: false,
        feedback: 'Route and schema location not found.',
        explanation:
          'Explore the src/routes/ directory for task creation handling, and trace the verified import to src/models/task.ts.',
        citations: [],
      };
    },
  },

  'mission-3': {
    evaluate: (answer: string, evidenceFiles: string[]) => {
      const lower = answer.toLowerCase();
      const hasHandler = lower.includes('error-handler.ts') || lower.includes('errorhandler') || evidenceFiles.includes('src/middleware/error-handler.ts');
      const hasApp = lower.includes('app.ts') || evidenceFiles.includes('src/app.ts');

      if (hasHandler) {
        return {
          correct: true,
          partial: false,
          feedback: 'Verified! Centralized error middleware and serialization confirmed.',
          explanation:
            'src/middleware/error-handler.ts implements the 4-parameter Express error handling signature (err, req, res, next) and formats all failures into standardized JSON responses with status codes and timestamps.',
          citations: [
            {
              id: 'c-3-err',
              file: 'src/middleware/error-handler.ts',
              lineStart: 8,
              lineEnd: 19,
              snippet: 'res.status(status).json({\n  error: {\n    message,\n    status,\n    timestamp: new Date().toISOString(),\n  },\n});',
              reason: 'Standardized JSON error formatting',
            },
          ],
        };
      }

      if (hasApp && !hasHandler) {
        return {
          correct: false,
          partial: true,
          feedback: 'Partially correct: You found where errorHandler is mounted in src/app.ts.',
          explanation:
            'src/app.ts mounts app.use(errorHandler), but the actual error formatting logic is defined in src/middleware/error-handler.ts. Check that file to see how uncaught errors are serialized.',
          citations: [
            {
              id: 'c-3-mount',
              file: 'src/app.ts',
              lineStart: 35,
              lineEnd: 36,
              snippet: '// Centralized error handler mounted last\napp.use(errorHandler);',
              reason: 'Mount point of error handler middleware',
            },
          ],
        };
      }

      return {
        correct: false,
        partial: false,
        feedback: 'Error middleware not identified.',
        explanation:
          'Look for middleware files in src/middleware/ that catch exceptions and format error JSON responses.',
        citations: [],
      };
    },
  },
};

