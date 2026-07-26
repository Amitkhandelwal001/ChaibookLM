import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { register, login, getMe } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsedData = registerSchema.parse(req.body);
  const result = await register(parsedData);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsedData = loginSchema.parse(req.body);
  const result = await login(parsedData);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - added by authMiddleware
  const userId = req.user.id;
  const user = await getMe(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
