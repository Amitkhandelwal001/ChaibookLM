import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import prisma from '../utils/prisma';

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { month, year } = req.query;

  const where: any = { userId };

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  res.status(200).json({ status: 'success', data: events });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { title, description, date, color } = req.body;
  if (!title || !date) throw new AppError('Title and date are required', 400);

  const event = await prisma.calendarEvent.create({
    data: { title, description, date: new Date(date), color: color || '#6366f1', userId },
  });

  res.status(201).json({ status: 'success', data: event });
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { id } = req.params;
  const { title, description, date, color } = req.body;

  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Event not found', 404);

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(date && { date: new Date(date) }),
      ...(color && { color }),
    },
  });

  res.status(200).json({ status: 'success', data: event });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Unauthorized', 401);

  const { id } = req.params;

  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Event not found', 404);

  await prisma.calendarEvent.delete({ where: { id } });

  res.status(200).json({ status: 'success', message: 'Event deleted' });
});
