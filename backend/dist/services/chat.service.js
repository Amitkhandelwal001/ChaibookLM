"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatTree = exports.getUserChats = exports.generateChatResponse = exports.createOrGetChat = void 0;
const embedding_service_1 = require("./embedding.service");
const vectorDb_service_1 = require("./vectorDb.service");
const genai_1 = require("@google/genai");
const prisma_1 = __importDefault(require("../utils/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Helper to trace back the message history for a specific branch
const getMessageHistory = async (leafMessageId) => {
    const history = [];
    let currentId = leafMessageId;
    // We loop to reconstruct the path to the root.
    // In a production app, recursive CTE queries or GraphQL might be better,
    // but this while loop works for typical chat lengths.
    while (currentId) {
        const msg = (await prisma_1.default.message.findUnique({ where: { id: currentId } }));
        if (!msg)
            break;
        history.unshift(msg); // Prepend to get chronological order
        currentId = msg.parentId;
    }
    return history;
};
const createOrGetChat = async (userId, title, chatId) => {
    if (chatId) {
        const chat = await prisma_1.default.chat.findUnique({ where: { id: chatId, userId } });
        if (chat)
            return chat;
    }
    return await prisma_1.default.chat.create({
        data: { title, userId }
    });
};
exports.createOrGetChat = createOrGetChat;
const generateChatResponse = async (question, userId, documentId, chatId, parentMessageId) => {
    try {
        // 1. Get or Create Chat
        const chatTitle = question.substring(0, 30) + '...';
        const chat = await (0, exports.createOrGetChat)(userId, chatTitle, chatId);
        // 2. Fetch conversational branch history
        let previousMessages = [];
        if (parentMessageId) {
            previousMessages = await getMessageHistory(parentMessageId);
        }
        // 3. Save User Message
        const userMessage = await prisma_1.default.message.create({
            data: {
                role: 'USER',
                content: question,
                chatId: chat.id,
                parentId: parentMessageId || null,
            }
        });
        // 4. Generate Embedding & Search Context
        const questionVector = await (0, embedding_service_1.generateEmbedding)(question);
        const searchResults = await (0, vectorDb_service_1.searchVectors)(questionVector, userId, documentId, 5);
        const contextChunks = searchResults
            .map(result => result.payload?.text)
            .filter(Boolean)
            .join('\n\n---\n\n');
        // 5. Format prompt with history
        let historyText = '';
        if (previousMessages.length > 0) {
            historyText = 'Previous Conversation History:\n' + previousMessages.map(m => `${m.role}: ${m.content}`).join('\n') + '\n\n';
        }
        const prompt = `You are KitbookLM, an AI learning assistant. 
Use the following pieces of retrieved context from the user's uploaded documents to answer the question.
If the answer is not in the context, just say that you don't know based on the provided documents. 
Do not make up an answer outside of the provided context.

${historyText}

Context:
${contextChunks}

Current Question:
USER: ${question}

Answer in markdown format:`;
        // 6. Generate AI Response
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const aiContent = response.text || 'No response generated.';
        // 7. Save AI Message
        const aiMessage = await prisma_1.default.message.create({
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
    }
    catch (error) {
        console.error('Error generating chat response:', error);
        throw new Error('Failed to generate chat response');
    }
};
exports.generateChatResponse = generateChatResponse;
const getUserChats = async (userId) => {
    return await prisma_1.default.chat.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
    });
};
exports.getUserChats = getUserChats;
const getChatTree = async (chatId, userId) => {
    // Returns all messages for a chat to let frontend build the tree
    const chat = await prisma_1.default.chat.findUnique({
        where: { id: chatId, userId },
    });
    if (!chat)
        throw new Error('Chat not found');
    const messages = await prisma_1.default.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
    });
    return { chat, messages };
};
exports.getChatTree = getChatTree;
