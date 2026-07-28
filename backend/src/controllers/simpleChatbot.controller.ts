import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import OpenAI from 'openai';

const openai = new OpenAI();

export const chatbotMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { message, history } = req.body;
  if (!message?.trim()) throw new AppError('Message is required', 400);

  // Build message history for context (last 20 messages)
  const pastMessages = (history || []).slice(-20).map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content as string,
  }));

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are KitbookLM AI, a helpful, friendly, and knowledgeable assistant. 
You help users with any questions they have — whether it's studying, coding, general knowledge, or anything else.
Be clear, concise, and conversational. Use markdown formatting where helpful (bullet points, code blocks, etc.).`,
      },
      ...pastMessages,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
  });

  const reply = completion.choices[0].message.content || 'I could not generate a response.';

  res.status(200).json({ status: 'success', data: { reply } });
});
