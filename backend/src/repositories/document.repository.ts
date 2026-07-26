import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const createDocument = async (data: Prisma.DocumentUncheckedCreateInput) => {
  return prisma.document.create({
    data,
  });
};

export const getDocumentsByUser = async (userId: string) => {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getDocumentById = async (id: string, userId: string) => {
  return prisma.document.findFirst({
    where: { id, userId },
  });
};

export const deleteDocument = async (id: string, userId: string) => {
  return prisma.document.deleteMany({
    where: { id, userId },
  });
};
