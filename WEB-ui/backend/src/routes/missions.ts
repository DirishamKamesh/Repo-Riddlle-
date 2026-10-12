import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../services/storage.js';
import { evaluateMissionSubmission } from '../services/gemini.js';
import { fetchFileContent } from '../services/github.js';

export const missionsRouter = Router();

const SubmitSchema = z.object({
  analysisId: z.string(),
  answer: z.string().min(1, 'Answer is required'),
  evidence: z
    .array(
      z.object({
        id: z.string().optional(),
        filePath: z.string(),
        lineStart: z.number(),
        lineEnd: z.number(),
        snippet: z.string(),
      })
    )
    .optional(),
  sessionToken: z.string().optional(),
});

missionsRouter.get('/:analysisId', async (req: Request, res: Response): Promise<void> => {
  const analysisId = String(req.params.analysisId);
  const record = await storage.getAnalysis(analysisId);

  if (!record) {
    res.status(404).json({ error: `Analysis ${analysisId} not found` });
    return;
  }

  res.json({
    missions: record.missions.map((m) => ({
      id: m.id,
      type: m.type,
      objective: m.objective,
      status: m.status,
      order: m.order,
    })),
  });
});

missionsRouter.get('/:missionId/detail', async (req: Request, res: Response): Promise<void> => {
  const missionId = String(req.params.missionId);
  const analysisId = req.query.analysisId as string;

  if (!analysisId) {
    res.status(400).json({ error: 'Query parameter "analysisId" is required' });
    return;
  }

  const record = await storage.getAnalysis(analysisId);
  if (!record) {
    res.status(404).json({ error: `Analysis ${analysisId} not found` });
    return;
  }

  const mission = record.missions.find((m) => m.id === missionId);
  if (!mission) {
    res.status(404).json({ error: `Mission ${missionId} not found` });
    return;
  }

  res.json({ mission });
});

missionsRouter.post('/:missionId/hint', async (req: Request, res: Response): Promise<void> => {
  const missionId = String(req.params.missionId);
  const { analysisId } = req.body;

  if (!analysisId) {
    res.status(400).json({ error: 'Body parameter "analysisId" is required' });
    return;
  }

  const record = await storage.getAnalysis(analysisId);
  if (!record) {
    res.status(404).json({ error: `Analysis ${analysisId} not found` });
    return;
  }

  const mission = record.missions.find((m) => m.id === missionId);
  if (!mission) {
    res.status(404).json({ error: `Mission ${missionId} not found` });
    return;
  }

  const currentUsed = record.hintsUsed[missionId] || 0;
  if (currentUsed >= mission.hints.length) {
    res.json({
      hint: mission.hints[mission.hints.length - 1],
      hintsUsed: mission.hints.length,
    });
    return;
  }

  const nextUsed = currentUsed + 1;
  record.hintsUsed[missionId] = nextUsed;

  res.json({
    hint: mission.hints[nextUsed - 1],
    hintsUsed: nextUsed,
  });
});

missionsRouter.post('/:missionId/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const missionId = String(req.params.missionId);
    const parseResult = SubmitSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid submit payload' });
      return;
    }

    const { analysisId, answer, evidence, sessionToken } = parseResult.data;
    const record = await storage.getAnalysis(analysisId);

    if (!record) {
      res.status(404).json({ error: `Analysis ${analysisId} not found` });
      return;
    }

    const mission = record.missions.find((m) => m.id === missionId);
    if (!mission) {
      res.status(404).json({ error: `Mission ${missionId} not found` });
      return;
    }

    // Fetch relevant source files for ground truth evaluation
    const sourceMap = new Map<string, string>();
    for (const f of mission.relevantFiles) {
      const fetched = await fetchFileContent(
        record.repository.owner,
        record.repository.name,
        record.commitSha,
        f
      );
      if (fetched.content) {
        sourceMap.set(f, fetched.content);
      }
    }

    const evidenceFiles = (evidence || []).map((e) => e.filePath);
    const evidenceSnippets = (evidence || []).map((e) => e.snippet);

    const feedback = await evaluateMissionSubmission(
      mission,
      answer,
      evidenceFiles,
      evidenceSnippets,
      sourceMap
    );

    // If answer is correct, update mission status and unlock next mission
    if (feedback.correct) {
      mission.status = 'completed';

      const currentIndex = record.missions.findIndex((m) => m.id === missionId);
      if (currentIndex >= 0 && currentIndex < record.missions.length - 1) {
        const nextMission = record.missions[currentIndex + 1];
        if (nextMission.status === 'locked') {
          nextMission.status = 'available';
        }
      }

      if (sessionToken) {
        const session = await storage.getSession(sessionToken);
        session.completedMissions.add(missionId);
      }

      await storage.saveAnalysis(record);
    }

    res.json({ feedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to evaluate mission submission' });
  }
});
