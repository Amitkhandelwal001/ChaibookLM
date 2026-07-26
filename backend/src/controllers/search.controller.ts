import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { performGlobalSearch, generateKnowledgeGraph } from '../services/search.service';

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  if (!query) {
    return res.status(400).json({ status: 'fail', message: 'Search query is required' });
  }

  const results = await performGlobalSearch(query, userId);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});

export const getKnowledgeGraph = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  const graphData = await generateKnowledgeGraph(userId);

  res.status(200).json({
    status: 'success',
    data: graphData,
  });
});
