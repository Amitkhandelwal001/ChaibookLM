import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { saveWhiteboard, getWhiteboard, getUserWhiteboards } from '../services/whiteboard.service';

export const saveWhiteboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const { title, data, id } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  if (!data) return res.status(400).json({ status: 'fail', message: 'Data is required' });

  const result = await saveWhiteboard(userId, title || 'Untitled Whiteboard', data, id);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getWhiteboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

  const result = await getWhiteboard(id as string, userId);

  if (!result) return res.status(404).json({ status: 'fail', message: 'Whiteboard not found' });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const listWhiteboardsHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

  const results = await getUserWhiteboards(userId);

  res.status(200).json({
    status: 'success',
    data: results,
  });
});
