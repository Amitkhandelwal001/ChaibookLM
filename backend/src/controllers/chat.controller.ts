import { Request, Response } from 'express';
import { generateChatResponse } from '../services/chat.service';
import { asyncHandler } from '../utils/asyncHandler';

export const handleChat = asyncHandler(async (req: Request, res: Response) => {
  const { question, documentId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ status: 'fail', message: 'Question is required and must be a string.' });
  }

  const answer = await generateChatResponse(question, userId, documentId);

  res.status(200).json({
    status: 'success',
    data: {
      answer,
    },
  });
});
