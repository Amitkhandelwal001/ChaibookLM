import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { processFileUpload, fetchUserDocuments, removeDocument, getDocumentUrl } from '../services/upload.service';
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

export const deleteDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) throw new AppError('Document ID is required', 400);

  await removeDocument(id, userId);

  res.status(200).json({
    status: 'success',
    message: 'Document deleted successfully',
  });
});

export const viewDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  // Support token via query param for browser window.open() calls
  const token = req.headers.authorization?.split(' ')[1] || (req.query.token as string);
  if (!token) throw new AppError('Unauthorized', 401);

  let userId: string;
  try {
    const { verifyToken } = require('../utils/jwt.utils');
    const decoded = verifyToken(token) as any;
    userId = decoded.id;
  } catch {
    throw new AppError('Invalid token', 401);
  }

  const { id } = req.params;
  const { url, isLocal } = await getDocumentUrl(id, userId);

  if (isLocal) {
    return res.sendFile(url);
  } else {
    return res.redirect(url);
  }
});
