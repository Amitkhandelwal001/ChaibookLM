"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbeddingsBatch = exports.generateEmbedding = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const generateEmbedding = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        // @ts-ignore
        return response.embeddings[0].values;
    }
    catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
};
exports.generateEmbedding = generateEmbedding;
const generateEmbeddingsBatch = async (texts) => {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: texts,
        });
        // @ts-ignore
        return response.embeddings.map(e => e.values);
    }
    catch (error) {
        console.error('Error generating embeddings batch:', error);
        throw new Error('Failed to generate embeddings batch');
    }
};
exports.generateEmbeddingsBatch = generateEmbeddingsBatch;
