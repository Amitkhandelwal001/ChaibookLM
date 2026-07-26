import { generateEmbedding } from './embedding.service';
import { searchVectors } from './vectorDb.service';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateChatResponse = async (question: string, userId: string, documentId?: string): Promise<string> => {
  try {
    // 1. Generate an embedding for the user's question
    const questionVector = await generateEmbedding(question);

    // 2. Search Qdrant for the most relevant chunks
    const searchResults = await searchVectors(questionVector, userId, documentId, 5);

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
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
};
