import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateStudyMaterials, getNotesByDocument, getFlashcardsByDocument } from '../services/study.service';
import { AppError } from '../utils/AppError';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant.config';

export const generateMaterials = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  if (!documentId) {
    return res.status(400).json({ status: 'fail', message: 'documentId is required' });
  }

  // Check if they already exist
  const existingNote = await getNotesByDocument(documentId, userId);
  if (existingNote) {
    return res.status(400).json({ status: 'fail', message: 'Study materials already generated for this document.' });
  }

  // Fetch the full document context from Qdrant
  const searchResult = await qdrantClient.scroll(COLLECTION_NAME, {
    filter: {
      must: [
        { key: 'userId', match: { value: userId } },
        { key: 'documentId', match: { value: documentId } },
      ],
    },
    limit: 100,
    with_payload: true,
  });

  const documentText = searchResult.points
    .map(p => p.payload?.text)
    .filter(Boolean)
    .join('\n\n');

  if (!documentText) {
    throw new AppError('Could not find processed text for this document.', 404);
  }

  const result = await generateStudyMaterials(documentId, userId, documentText);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const fetchStudyData = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

  const note = await getNotesByDocument(documentId as string, userId);
  const flashcards = await getFlashcardsByDocument(documentId as string, userId);

  res.status(200).json({
    status: 'success',
    data: {
      note,
      flashcards,
    },
  });
});
