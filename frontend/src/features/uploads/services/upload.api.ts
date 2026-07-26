import axios from 'axios';
import { Document } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const uploadFileFn = async (file: File, token: string): Promise<{ status: string; data: Document }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchDocumentsFn = async (token: string): Promise<{ status: string; data: Document[] }> => {
  const response = await axios.get(`${API_URL}/upload`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteDocumentFn = async (id: string, token: string): Promise<void> => {
  await axios.delete(`${API_URL}/upload/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
