import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.js';

export const sessionsRouter = Router();

sessionsRouter.post('/', async (_req: Request, res: Response): Promise<void> => {
  const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const session = await storage.getSession(token);

  res.status(201).json({
    token: session.token,
    sessionId: session.id,
  });
});

sessionsRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || 'default';
  const session = await storage.getSession(token);

  res.json({
    sessionId: session.id,
    token: session.token,
    completedMissions: Array.from(session.completedMissions),
  });
});

sessionsRouter.get('/me/dashboard', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || undefined;

  const repositories = await storage.listDashboardRepos(token);
  res.json({ repositories });
});
