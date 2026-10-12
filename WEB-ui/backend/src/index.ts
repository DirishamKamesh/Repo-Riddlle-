import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { repoRouter } from './routes/repo.js';
import { analysisRouter } from './routes/analysis.js';
import { graphRouter } from './routes/graph.js';
import { missionsRouter } from './routes/missions.js';
import { sessionsRouter } from './routes/sessions.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.FRONTEND_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));

// Request logging middleware with request ID
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = Math.random().toString(36).substring(2, 8);
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      githubAuth: Boolean(config.GITHUB_TOKEN),
      geminiConfigured: Boolean(config.GEMINI_API_KEY),
      geminiModel: config.GEMINI_MODEL,
      databaseConfigured: Boolean(config.DATABASE_URL),
    },
  });
});

// API Routes
app.use('/api/repo', repoRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/graph', graphRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/sessions', sessionsRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(config.PORT, () => {
  console.log(`🚀 RepoRiddle Backend server listening on http://localhost:${config.PORT}`);
  console.log(`   Frontend Origin: ${config.FRONTEND_ORIGIN}`);
  console.log(`   GitHub Token: ${config.GITHUB_TOKEN ? 'Configured ✅' : 'Unauthenticated (60 req/hr) ⚠️'}`);
  console.log(`   Gemini AI: ${config.GEMINI_API_KEY ? `Configured (${config.GEMINI_MODEL}) ✅` : 'Deterministic Grounded Engine ⚠️'}`);
  console.log(`   Persistence: ${config.DATABASE_URL ? 'Supabase/PostgreSQL ✅' : 'In-Memory / Local Cache ⚠️'}`);
});

export default app;
