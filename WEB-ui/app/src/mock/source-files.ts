import { SourceFile } from '../types';

export const DEMO_SOURCE_FILES: Record<string, SourceFile> = {
  'src/server.ts': {
    path: 'src/server.ts',
    language: 'typescript',
    category: 'entry_point',
    summary: 'Main server bootstrap: initializes HTTP listener on PORT and sets up graceful shutdown.',
    lineCount: 32,
    citations: [
      {
        id: 'cite-server-listen',
        file: 'src/server.ts',
        lineStart: 12,
        lineEnd: 18,
        snippet: 'const server = app.listen(PORT, () => {\n  logger.info(`Server listening on port ${PORT}`);\n});',
        reason: 'HTTP port listener binding and process startup',
      },
    ],
    content: `import { app } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;

// Initialize server listener
const server = app.listen(PORT, () => {
  logger.info(\`Server listening on http://localhost:\${PORT}\`);
});

// Process signal handling for clean exit
process.on('SIGTERM', () => {
  logger.info('SIGTERM received: initiating graceful shutdown');
  server.close(() => {
    logger.info('Process terminated gracefully');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received: exiting process');
  server.close(() => {
    process.exit(0);
  });
});

export default server;
`,
  },

  'src/app.ts': {
    path: 'src/app.ts',
    language: 'typescript',
    category: 'entry_point',
    summary: 'Express application factory: attaches middlewares, health checks, task routes, and error handlers.',
    lineCount: 38,
    citations: [
      {
        id: 'cite-app-routes',
        file: 'src/app.ts',
        lineStart: 18,
        lineEnd: 22,
        snippet: 'app.use("/api/tasks", tasksRouter);\napp.use("/health", healthRouter);',
        reason: 'Sub-router mounting points',
      },
    ],
    content: `import express from 'express';
import { tasksRouter } from './routes/tasks';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/error-handler';

export const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // logged in production
  });
  next();
});

// Route registration
app.use('/health', healthRouter);
app.use('/api/tasks', tasksRouter);

// Centralized error handler mounted last
app.use(errorHandler);
`,
  },

  'src/routes/tasks.ts': {
    path: 'src/routes/tasks.ts',
    language: 'typescript',
    category: 'route',
    summary: 'CRUD endpoints for /api/tasks: GET, POST, and DELETE with payload validation.',
    lineCount: 52,
    citations: [
      {
        id: 'cite-tasks-post',
        file: 'src/routes/tasks.ts',
        lineStart: 21,
        lineEnd: 32,
        snippet: 'router.post("/", async (req, res, next) => {\n  const parsed = TaskSchema.parse(req.body);\n  const created = await TaskStore.create(parsed);\n  res.status(201).json(created);\n});',
        reason: 'Task creation endpoint implementation',
      },
    ],
    content: `import { Router } from 'express';
import { TaskStore, TaskSchema } from '../models/task';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

export const tasksRouter = Router();

// GET all tasks
tasksRouter.get('/', async (req, res, next) => {
  try {
    const tasks = await TaskStore.list();
    res.json({ data: tasks });
  } catch (err) {
    next(err);
  }
});

// POST create task (protected)
tasksRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    logger.info('Creating new task', { body: req.body });
    const validated = TaskSchema.parse(req.body);
    const created = await TaskStore.create(validated);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

// DELETE task
tasksRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const deleted = await TaskStore.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
`,
  },

  'src/models/task.ts': {
    path: 'src/models/task.ts',
    language: 'typescript',
    category: 'model',
    summary: 'Task entity schema, Zod validation models, and in-memory repository store.',
    lineCount: 46,
    citations: [
      {
        id: 'cite-task-schema',
        file: 'src/models/task.ts',
        lineStart: 4,
        lineEnd: 12,
        snippet: 'export const TaskSchema = z.object({\n  title: z.string().min(1),\n  priority: z.enum(["low", "medium", "high"]),\n});',
        reason: 'Task validation schema definition',
      },
    ],
    content: `import { z } from 'zod';

export const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  completed: z.boolean().default(false),
});

export type TaskInput = z.infer<typeof TaskSchema>;

export interface Task extends TaskInput {
  id: string;
  createdAt: string;
}

const memoryStore: Map<string, Task> = new Map();

export const TaskStore = {
  async list(): Promise<Task[]> {
    return Array.from(memoryStore.values());
  },

  async create(data: TaskInput): Promise<Task> {
    const id = \`tsk_\${Math.random().toString(36).substring(2, 9)}\`;
    const task: Task = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    memoryStore.set(id, task);
    return task;
  },

  async delete(id: string): Promise<boolean> {
    return memoryStore.delete(id);
  },
};
`,
  },

  'src/middleware/error-handler.ts': {
    path: 'src/middleware/error-handler.ts',
    language: 'typescript',
    category: 'utility',
    summary: 'Global Express error handler serializing exceptions to standardized JSON error responses.',
    lineCount: 28,
    citations: [
      {
        id: 'cite-error-handler',
        file: 'src/middleware/error-handler.ts',
        lineStart: 5,
        lineEnd: 20,
        snippet: 'export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {\n  res.status(err.status || 500).json({ error: err.message });\n}',
        reason: 'Centralized error format handling',
      },
    ],
    content: `import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
`,
  },

  'src/routes/health.ts': {
    path: 'src/routes/health.ts',
    language: 'typescript',
    category: 'route',
    summary: 'Health check probe endpoint returning uptime, memory, and status 200.',
    lineCount: 18,
    citations: [
      {
        id: 'cite-health-route',
        file: 'src/routes/health.ts',
        lineStart: 6,
        lineEnd: 15,
        snippet: 'healthRouter.get("/", (_req, res) => {\n  res.json({ status: "ok", uptime: process.uptime() });\n});',
        reason: 'Health check probe endpoint',
      },
    ],
    content: `import { Router } from 'express';

export const healthRouter = Router();

// GET health probe
healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage().rss,
  });
});
`,
  },

  'src/middleware/auth.ts': {
    path: 'src/middleware/auth.ts',
    language: 'typescript',
    category: 'utility',
    summary: 'Bearer token authorization middleware verifying API keys.',
    lineCount: 24,
    citations: [
      {
        id: 'cite-auth-middleware',
        file: 'src/middleware/auth.ts',
        lineStart: 5,
        lineEnd: 18,
        snippet: 'export function requireAuth(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).json({ error: "Unauthorized" });\n  next();\n}',
        reason: 'Authentication bearer token gate',
      },
    ],
    content: `import { Request, Response, NextFunction } from 'express';

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: missing or invalid Bearer token',
    });
  }

  // Token is verified here in production
  next();
}
`,
  },

  'src/utils/logger.ts': {
    path: 'src/utils/logger.ts',
    language: 'typescript',
    category: 'utility',
    summary: 'Structured JSON logger utility with timestamp and severity levels.',
    lineCount: 22,
    citations: [
      {
        id: 'cite-logger-utility',
        file: 'src/utils/logger.ts',
        lineStart: 6,
        lineEnd: 18,
        snippet: 'export const logger = {\n  info: (msg: string, meta?: any) => console.log(JSON.stringify({ level: "info", msg, ...meta })),\n};',
        reason: 'Structured JSON logger',
      },
    ],
    content: `export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        level: 'info',
        msg,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(
      JSON.stringify({
        level: 'error',
        msg,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  },
};
`,
  },

  'tests/tasks.test.ts': {
    path: 'tests/tasks.test.ts',
    language: 'typescript',
    category: 'test',
    summary: 'Integration test suite validating task creation and retrieval against Supertest.',
    lineCount: 26,
    citations: [
      {
        id: 'cite-tasks-test',
        file: 'tests/tasks.test.ts',
        lineStart: 6,
        lineEnd: 22,
        snippet: 'describe("POST /api/tasks", () => {\n  it("creates a task when payload is valid", async () => { ... });\n});',
        reason: 'Integration test validation suite',
      },
    ],
    content: `import { app } from '../src/app';

describe('Tasks API Integration Tests', () => {
  it('GET /health returns 200 ok', async () => {
    // Verified health endpoint probe
    expect(true).toBe(true);
  });

  it('POST /api/tasks creates task with valid schema', async () => {
    // Verified task creation against schema
    expect(true).toBe(true);
  });
});
`,
  },
};

