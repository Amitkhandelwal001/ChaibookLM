import fs from 'fs';
import path from 'path';
import { findUserById } from '../repositories/user.repository';
import { createDocument, getDocumentsByUser } from '../repositories/document.repository';
import { AppError } from '../utils/AppError';
import prisma from '../utils/prisma';
import cloudinary from '../config/cloudinary.config';
import { processDocumentBackground } from './documentProcessor.service';

const MAX_STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB

export const processFileUpload = async (userId: string, file: Express.Multer.File) => {
  const user = await findUserById(userId);
  if (!user) {
    // Delete local temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError('User not found', 404);
  }

  const newTotalStorage = user.storageUsed + file.size;
  if (newTotalStorage > MAX_STORAGE_LIMIT) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new AppError('Upload limit of 100MB exceeded.', 400);
  }

  const fileType = file.mimetype.split('/')[0] === 'image' ? 'IMAGE' : 'DOCUMENT';

  let fileUrl = '';
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: `kitbooklm/users/${user.id}`,
    });
    fileUrl = result.secure_url;
    // Delete local temp file after successful cloud upload
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // FALLBACK: If Cloudinary fails (e.g. free tier PDF restriction), 
    // keep the file locally so we can still extract text from it.
    fileUrl = file.path;
  }

  // Transaction to update user storage and create document
  const document = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: {
        title: file.originalname,
        type: fileType,
        url: fileUrl, // Store Cloudinary URL or local fallback path
        size: file.size,
        userId: user.id,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { storageUsed: newTotalStorage },
    });

    return doc;
  });

  // Fire and forget background processing
  processDocumentBackground(document.id, user.id);

  return document;
};

export const fetchUserDocuments = async (userId: string) => {
  return getDocumentsByUser(userId);
};

export const removeDocument = async (documentId: string, userId: string) => {
  // Also delete related Qdrant vectors
  try {
    const { qdrantClient, COLLECTION_NAME } = require('../config/qdrant.config');
    await qdrantClient.delete(COLLECTION_NAME, {
      filter: {
        must: [
          { key: 'documentId', match: { value: documentId } },
          { key: 'userId', match: { value: userId } },
        ],
      },
    });
  } catch (e) {
    console.warn('Could not delete Qdrant vectors:', e);
  }

  return deleteDocument(documentId, userId);
};
