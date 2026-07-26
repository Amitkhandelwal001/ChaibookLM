import { generateEmbedding } from './embedding.service';
import { searchVectors } from './vectorDb.service';
import OpenAI from 'openai';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI();

import { Message } from '@prisma/client';

// Helper to trace back the message history for a specific branch
const getMessageHistory = async (leafMessageId: string) => {
  const history: Message[] = [];
  let currentId: string | null = leafMessageId;

  // We loop to reconstruct the path to the root.
  while (currentId) {
    const msg = (await prisma.message.findUnique({ where: { id: currentId } })) as Message | null;
    if (!msg) break;
    history.unshift(msg); // Prepend to get chronological order
    currentId = msg.parentId;
  }
  return history;
};

export const createOrGetChat = async (userId: string, title: string, chatId?: string) => {
  if (chatId) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId, userId } });
    if (chat) return chat;
  }
  return await prisma.chat.create({
    data: { title, userId }
  });
};

export const generateChatResponse = async (
  question: string, 
  userId: string, 
  documentId?: string,
  chatId?: string,
  parentMessageId?: string
) => {
  try {
    // 1. Get or Create Chat
    const chatTitle = question.substring(0, 30) + '...';
    const chat = await createOrGetChat(userId, chatTitle, chatId);

    // 2. Fetch conversational branch history
    let previousMessages: Message[] = [];
    if (parentMessageId) {
      previousMessages = await getMessageHistory(parentMessageId);
    }

    // 3. Save User Message
    const userMessage = await prisma.message.create({
      data: {
        role: 'USER',
        content: question,
        chatId: chat.id,
        parentId: parentMessageId || null,
      }
    });

    // 4. Generate Embedding & Search Context
    const questionVector = await generateEmbedding(question);
    const searchResults = await searchVectors(questionVector, userId, documentId, 5);

    const contextChunks = searchResults
      .map(result => result.payload?.text)
      .filter(Boolean)
      .join('\n\n---\n\n');

    // 5. Format prompt with history for OpenAI messages
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are KitbookLM, an AI learning assistant. 
Use the following pieces of retrieved context from the user's uploaded documents to answer the question.
If the answer is not in the context, just say that you don't know based on the provided documents. 
Do not make up an answer outside of the provided context.

Context:
${contextChunks}`
      }
    ];

    for (const msg of previousMessages) {
      messages.push({
        role: msg.role === 'USER' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    messages.push({
      role: "user",
      content: question
    });

    // 6. Generate AI Response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const aiContent = response.choices[0].message.content || 'No response generated.';

    // 7. Save AI Message
    const aiMessage = await prisma.message.create({
      data: {
        role: 'AI',
        content: aiContent,
        chatId: chat.id,
        parentId: userMessage.id, // AI message is a child of the user message
      }
    });

    return {
      chatId: chat.id,
      userMessage,
      aiMessage,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
};

export const getUserChats = async (userId: string) => {
  return await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
};

export const getChatTree = async (chatId: string, userId: string) => {
  // Returns all messages for a chat to let frontend build the tree
  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId },
  });
  if (!chat) throw new Error('Chat not found');

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });

  return { chat, messages };
};
