import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { processFileUpload, fetchUserDocuments } from '../services/upload.service';
import { AppError } from '../utils/AppError';

export const uploadFileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  // @ts-ignore
  const userId = req.user.id;
  const document = await processFileUpload(userId, req.file);

  res.status(201).json({
    status: 'success',
    data: document,
  });
});

export const getDocumentsHandler = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const documents = await fetchUserDocuments(userId);

  res.status(200).json({
    status: 'success',
    data: documents,
  });
});
