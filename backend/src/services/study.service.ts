import { GoogleGenAI } from '@google/genai';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateStudyMaterials = async (documentId: string, userId: string, documentText: string) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    const docTitle = document?.title || 'Document';

    // Prompt 1: Generate Notes
    const notesPrompt = `You are KitbookLM, an expert AI tutor.
I am going to provide you with a text.
Your task is to extract comprehensive, highly structured study notes from it.
Use markdown to format the notes beautifully with headers (H1, H2, H3), bullet points, and bold text for important concepts.
Do not include any introductory or conversational text, just the raw markdown notes.

Text:
${documentText}`;

    // Prompt 2: Generate Flashcards
    const flashcardsPrompt = `You are KitbookLM, an expert AI tutor.
I am going to provide you with a text.
Your task is to generate exactly 10 flashcards from the most important concepts in the text.
You MUST output the result as a strict JSON array of objects, where each object has a "question" string and an "answer" string.
Do NOT wrap the JSON in markdown code blocks like \`\`\`json. Just output the raw JSON array.
Example format:
[
  { "question": "What is X?", "answer": "X is Y." }
]

Text:
${documentText}`;

    console.log(`Generating study notes and flashcards for document ${documentId}...`);
    
    // Run both generations in parallel
    const [notesResponse, flashcardsResponse] = await Promise.all([
      ai.models.generateContent({ model: 'gemini-2.5-flash', contents: notesPrompt }),
      ai.models.generateContent({ model: 'gemini-2.5-flash', contents: flashcardsPrompt }),
    ]);

    const markdownNotes = notesResponse.text || '';
    let flashcardsData = [];

    // Parse the JSON safely
    try {
      let rawJson = flashcardsResponse.text || '[]';
      // Strip markdown backticks if Gemini accidentally includes them despite instructions
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/```json\n?/, '').replace(/```\n?$/, '');
      }
      flashcardsData = JSON.parse(rawJson);
    } catch (e) {
      console.error('Failed to parse flashcards JSON:', flashcardsResponse.text);
      throw new Error('AI returned invalid JSON for flashcards.');
    }

    // Save to Database
    const note = await prisma.note.create({
      data: {
        title: `${docTitle} - Structured Notes`,
        content: markdownNotes,
        documentId,
        userId,
      }
    });

    // Bulk create flashcards
    const flashcardInserts = flashcardsData.map((card: any) => ({
      question: card.question,
      answer: card.answer,
      documentId,
      userId,
    }));

    await prisma.flashcard.createMany({
      data: flashcardInserts,
    });

    return {
      note,
      flashcardsCount: flashcardInserts.length,
    };
  } catch (error) {
    console.error('Error generating study materials:', error);
    throw error;
  }
};

export const getNotesByDocument = async (documentId: string, userId: string) => {
  return await prisma.note.findFirst({
    where: { documentId, userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getFlashcardsByDocument = async (documentId: string, userId: string) => {
  return await prisma.flashcard.findMany({
    where: { documentId, userId },
    orderBy: { createdAt: 'asc' },
  });
};
