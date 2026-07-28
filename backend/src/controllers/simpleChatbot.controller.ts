import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import OpenAI from 'openai';
import prisma from '../utils/prisma';

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are KitbookLM AI, a helpful, friendly, and knowledgeable assistant.
You help users with any questions they have — whether it's studying, coding, general knowledge, or anything else.
Be clear, concise, and conversational. Use markdown formatting where helpful (bullet points, code blocks, bold text, etc.).`;

// POST /api/chatbot/message
export const chatbotMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { message, chatId } = req.body;
  if (!message?.trim()) throw new AppError('Message is required', 400);

  // 1. Resolve or create chat session
  let chat;
  if (chatId) {
    chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new AppError('Chat session not found', 404);
  } else {
    // Auto-generate a title from first message (truncated)
    const title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
    chat = await prisma.chat.create({ data: { title, userId } });
  }

  // 2. Load full message history for this chat (for context)
  const existingMessages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    take: 40, // Last 40 messages for context
  });

  // 3. Save user message
  const userMessage = await prisma.message.create({
    data: { role: 'USER', content: message, chatId: chat.id },
  });

  // 4. Build OpenAI messages from DB history
  const historyMessages = existingMessages.map((m) => ({
    role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyMessages,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  });

  const reply = completion.choices[0].message.content || 'I could not generate a response.';

  // 5. Save AI reply
  const aiMessage = await prisma.message.create({
    data: { role: 'AI', content: reply, chatId: chat.id, parentId: userMessage.id },
  });

  // 6. Update chat timestamp
  await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } });

  res.status(200).json({
    status: 'success',
    data: { chatId: chat.id, userMessage, aiMessage, reply },
  });
});

// GET /api/chatbot/chats — list all chats for user
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
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });

  res.status(200).json({ status: 'success', data: chats });
});

// GET /api/chatbot/chats/:chatId — get full chat with messages
export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { chatId } = req.params;
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!chat) throw new AppError('Chat not found', 404);

  res.status(200).json({ status: 'success', data: chat });
});

// DELETE /api/chatbot/chats/:chatId
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { chatId } = req.params;
  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) throw new AppError('Chat not found', 404);

  // Cascade deletes messages due to schema onDelete: Cascade
  await prisma.chat.delete({ where: { id: chatId } });

  res.status(200).json({ status: 'success', message: 'Chat deleted' });
});
