import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { extractVideoHighlights } from '../services/video.service';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const generateHighlightsSchema = z.object({
  youtubeUrl: z.string().url('Must be a valid URL'),
});

export const generateHighlightsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { youtubeUrl } = generateHighlightsSchema.parse(req.body);

  const highlights = await extractVideoHighlights(youtubeUrl);

  res.status(200).json({
    status: 'success',
    data: highlights,
  });
});
