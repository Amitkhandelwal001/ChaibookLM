import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { generateEmbedding } from '../services/embedding.service';
import { searchVectors } from '../services/vectorDb.service';
import prisma from '../utils/prisma';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI();

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, documentId, chatId, parentId } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new AppError('Unauthorized', 401);
  if (!content) throw new AppError('Message content is required', 400);

  // --- 1. Resolve or create the Chat session ---
  let chat;
  if (chatId) {
    chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new AppError('Chat not found', 404);
  } else {
    chat = await prisma.chat.create({
      data: {
        title: content.slice(0, 60),
        userId,
      },
    });
  }

  // --- 2. Save the user message ---
  const userMessage = await prisma.message.create({
    data: {
      role: 'USER',
      content,
      chatId: chat.id,
      parentId: parentId || null,
    },
  });

  // --- 3. RAG: embed query and fetch relevant context ---
  let contextText = '';
  try {
    const queryVector = await generateEmbedding(content);
    const searchResults = await searchVectors(queryVector, userId, documentId, 5);
    contextText = searchResults
      .map((r) => r.payload?.text as string)
      .filter(Boolean)
      .join('\n\n---\n\n');
  } catch (err) {
    console.warn('Vector search failed, proceeding without context:', err);
  }

  // --- 4. Build prompt and call OpenAI ---
  const systemPrompt = contextText
    ? `You are KitbookLM, an expert AI study assistant. Answer the user's question based on the following context extracted from their documents. Be concise, accurate, and cite key points.\n\nContext:\n${contextText}`
    : `You are KitbookLM, an expert AI study assistant. Answer the user's question thoughtfully. No document context was found, so answer from general knowledge.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ],
    temperature: 0.4,
  });

  const aiContent = completion.choices[0].message.content || 'I could not generate a response.';

  // --- 5. Save AI message (child of user message) ---
  const aiMessage = await prisma.message.create({
    data: {
      role: 'AI',
      content: aiContent,
      chatId: chat.id,
      parentId: userMessage.id,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      chatId: chat.id,
      userMessage,
      aiMessage,
    },
  });
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new AppError('Unauthorized', 401);

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!chat) throw new AppError('Chat not found', 404);

  res.status(200).json({
    status: 'success',
    data: chat,
  });
});

export const getUserChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: chats,
  });
});
