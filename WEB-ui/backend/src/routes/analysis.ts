import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.js';

export const analysisRouter = Router();

analysisRouter.get('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const record = await storage.getAnalysis(id);

  if (!record) {
    res.status(404).json({ error: `Analysis ${id} not found` });
    return;
  }

  res.json({
    status: record.status,
    progress: {
      stage: record.stage,
      detail: record.stageDetail,
    },
    graphId: record.id,
    missionIds: record.missions.map((m) => m.id),
  });
});

analysisRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const record = await storage.getAnalysis(id);

  if (!record) {
    res.status(404).json({ error: `Analysis ${id} not found` });
    return;
  }

  res.json({
    analysisId: record.id,
    repository: record.repository,
    status: record.status,
    fileTree: record.fileTree,
    commitSha: record.commitSha,
    missionsTotal: record.missions.length,
  });
});
