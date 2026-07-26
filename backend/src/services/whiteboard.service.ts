import prisma from '../utils/prisma';

export const saveWhiteboard = async (userId: string, title: string, data: any, id?: string) => {
  if (id) {
    return await prisma.whiteboard.update({
      where: { id, userId },
      data: { title, data }
    });
  }
  
  return await prisma.whiteboard.create({
    data: {
      userId,
      title,
      data,
    }
  });
};

export const getWhiteboard = async (id: string, userId: string) => {
  return await prisma.whiteboard.findUnique({
    where: { id, userId }
  });
};

export const getUserWhiteboards = async (userId: string) => {
  return await prisma.whiteboard.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true
      // Omit heavy JSON data for list view
    }
  });
};
