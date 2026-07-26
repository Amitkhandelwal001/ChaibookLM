import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAndStorePodcast, getUserPodcasts } from '../services/podcast.service';
import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant.config';

export const generatePodcast = asyncHandler(async (req: Request, res: Response) => {
  const { documentId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  if (!documentId) {
    return res.status(400).json({ status: 'fail', message: 'documentId is required' });
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
    throw new AppError('Could not find processed text for this document. Please ensure it was processed successfully.', 404);
  }

  // Generate and store
  const podcast = await generateAndStorePodcast(documentId, userId, documentText);

  res.status(201).json({
    status: 'success',
    data: {
      podcast,
    },
  });
});

export const fetchPodcasts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
  }

  const podcasts = await getUserPodcasts(userId);

  res.status(200).json({
    status: 'success',
    data: {
      podcasts,
    },
  });
});
