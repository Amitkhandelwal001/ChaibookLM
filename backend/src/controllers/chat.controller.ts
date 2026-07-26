import { Request, Response } from 'express';
import { generateChatResponse, getUserChats, getChatTree } from '../services/chat.service';
import { asyncHandler } from '../utils/asyncHandler';

export const handleChat = asyncHandler(async (req: Request, res: Response) => {
  const { question, documentId, chatId, parentMessageId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ status: 'fail', message: 'Question is required and must be a string.' });
  }

  const result = await generateChatResponse(question, userId, documentId, chatId, parentMessageId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const fetchUserChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

  const chats = await getUserChats(userId);

  res.status(200).json({
    status: 'success',
    data: { chats },
  });
});

export const fetchChatTree = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chatId } = req.params;
  
  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

  const tree = await getChatTree(chatId as string, userId);

  res.status(200).json({
    status: 'success',
    data: tree,
  });
});
