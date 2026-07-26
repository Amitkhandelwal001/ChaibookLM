import OpenAI from 'openai';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI();

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

Text:
${documentText}`;

    console.log(`Generating study notes and flashcards for document ${documentId}...`);
    
    // Run generation
    const promises: Promise<any>[] = [
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: notesPrompt }],
        temperature: 0.3,
      })
    ];
    
    if (includeFlashcards) {
      promises.push(
        openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: flashcardsPrompt }],
          temperature: 0.3,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "flashcards",
              schema: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" }
                      },
                      required: ["question", "answer"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["flashcards"],
                additionalProperties: false
              },
              strict: true
            }
          }
        })
      );
    }

    const results = await Promise.all(promises);
    const notesResponse = results[0];
    const markdownNotes = notesResponse.choices[0].message.content || '';
    
    let flashcardInserts: any[] = [];

    if (includeFlashcards && results[1]) {
      const flashcardsResponse = results[1];
      const content = flashcardsResponse.choices[0].message.content;
      
      let flashcardsData = [];
      if (content) {
        try {
          const parsed = JSON.parse(content);
          flashcardsData = parsed.flashcards || [];
        } catch (e) {
          console.error('Failed to parse flashcards JSON:', content);
        }
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
