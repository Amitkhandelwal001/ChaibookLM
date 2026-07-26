import axios from 'axios';
import { AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

export const loginFn = async (data: any): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const registerFn = async (data: any): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const getMeFn = async (token: string): Promise<AuthResponse> => {
  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
