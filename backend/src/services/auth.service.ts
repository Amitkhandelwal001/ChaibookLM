import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { generateToken } from '../utils/jwt.utils';
import { RegisterInput, LoginInput } from '../validations/auth.validation';

export const register = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed }, token };
};

export const login = async (data: LoginInput) => {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed }, token };
};

export const getMe = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed };
};
