import { GoogleGenAI } from '@google/genai';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateStudyMaterials = async (documentId: string, userId: string, documentText: string, sections: string[]) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    const docTitle = document?.title || 'Document';

    const defaultSections = ['Summary', 'Key Points', 'Examples', 'Interview Questions', 'Revision Notes', 'Cheat Sheet', 'Mind Maps'];
    const requestedMarkdownSections = sections.length > 0 
      ? sections.filter(s => s !== 'Flashcards')
      : defaultSections;

    const includeFlashcards = sections.length === 0 || sections.includes('Flashcards');

    let sectionInstructions = requestedMarkdownSections.map(s => `- ${s}`).join('\n');
    if (requestedMarkdownSections.includes('Mind Maps')) {
      sectionInstructions += '\n- For Mind Maps, you MUST output a valid Mermaid.js graph inside a ```mermaid block.';
    }

    // Prompt 1: Generate Notes
    const notesPrompt = `You are KitbookLM, an expert AI tutor.
I am going to provide you with a text.
Your task is to extract comprehensive, highly structured study notes from it.
You MUST include ONLY the following sections:
${sectionInstructions}

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
    
    // Run generation
    const promises: Promise<any>[] = [
      ai.models.generateContent({ model: 'gemini-2.5-flash', contents: notesPrompt })
    ];
    
    if (includeFlashcards) {
      promises.push(ai.models.generateContent({ model: 'gemini-2.5-flash', contents: flashcardsPrompt }));
    }

    const results = await Promise.all(promises);
    const notesResponse = results[0];
    const markdownNotes = notesResponse.text || '';
    
    let flashcardInserts: any[] = [];

    if (includeFlashcards && results[1]) {
      const flashcardsResponse = results[1];
      let flashcardsData = [];

      // Parse the JSON safely
      try {
        let rawJson = flashcardsResponse.text || '[]';
        // Strip markdown backticks if Gemini accidentally includes them despite instructions
        if (rawJson.startsWith('\`\`\`json')) {
          rawJson = rawJson.replace(/\`\`\`json\n?/, '').replace(/\`\`\`\n?$/, '');
        } else if (rawJson.startsWith('\`\`\`')) {
          rawJson = rawJson.replace(/\`\`\`\n?/, '').replace(/\`\`\`\n?$/, '');
        }
        flashcardsData = JSON.parse(rawJson);
      } catch (e) {
        console.error('Failed to parse flashcards JSON:', flashcardsResponse.text);
      }

      flashcardInserts = flashcardsData.map((card: any) => ({
        question: card.question,
        answer: card.answer,
        documentId,
        userId,
      }));

      if (flashcardInserts.length > 0) {
        await prisma.flashcard.createMany({
          data: flashcardInserts,
        });
      }
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
