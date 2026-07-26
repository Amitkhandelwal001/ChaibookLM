"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatResponse = void 0;
const embedding_service_1 = require("./embedding.service");
const vectorDb_service_1 = require("./vectorDb.service");
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const generateChatResponse = async (question, userId, documentId) => {
    try {
        // 1. Generate an embedding for the user's question
        const questionVector = await (0, embedding_service_1.generateEmbedding)(question);
        // 2. Search Qdrant for the most relevant chunks
        const searchResults = await (0, vectorDb_service_1.searchVectors)(questionVector, userId, documentId, 5);
        // 3. Extract the text from the search results
        const contextChunks = searchResults
            .map(result => result.payload?.text)
            .filter(text => text !== undefined && text !== null)
            .join('\n\n---\n\n');
        // 4. Construct the prompt for Gemini
        const prompt = `You are KitbookLM, an AI learning assistant. 
Use the following pieces of retrieved context from the user's uploaded documents to answer the question.
If the answer is not in the context, just say that you don't know based on the provided documents. 
Do not make up an answer outside of the provided context.

Context:
${contextChunks}

Question:
${question}

Answer in markdown format:`;
        // 5. Generate response using Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || 'No response generated.';
    }
    catch (error) {
        console.error('Error generating chat response:', error);
        throw new Error('Failed to generate chat response');
    }
};
exports.generateChatResponse = generateChatResponse;
