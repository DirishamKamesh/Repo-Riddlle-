import { Router, Request, Response } from 'express';
import { storage } from '../services/storage.js';
import { fetchFileContent } from '../services/github.js';
import { classifyFilePath } from '../services/analyzer.js';
import { SourceFile } from '../types/index.js';

export const graphRouter = Router();

graphRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const record = await storage.getAnalysis(id);

  if (!record) {
    res.status(404).json({ error: `Graph ${id} not found` });
    return;
  }

  res.json({
    graph: record.graphData,
    fileTree: record.fileTree,
  });
});

graphRouter.get('/:id/file', async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({ error: 'Query parameter "path" is required' });
    return;
  }

  const record = await storage.getAnalysis(id);
  if (!record) {
    res.status(404).json({ error: `Analysis ${id} not found` });
    return;
  }

  // Fetch actual source content on-demand if not preloaded
  const contentResult = await fetchFileContent(
    record.repository.owner,
    record.repository.name,
    record.commitSha,
    filePath
  );

  const { category } = classifyFilePath(filePath);
  const lines = (contentResult.content || '').split('\n');

  const sourceFile: SourceFile = {
    path: filePath,
    content: contentResult.content,
    language: filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'javascript',
    category,
    summary: contentResult.content
      ? `Real source code for ${filePath} (${lines.length} lines)`
      : contentResult.error || 'Failed to fetch file content',
    citations: [],
    lineCount: lines.length,
  };

  res.json({ file: sourceFile });
});
