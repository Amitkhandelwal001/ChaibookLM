import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

export interface Highlight {
  timestampSeconds: number;
  formattedTime: string;
  title: string;
  summary: string;
}

export const generateVideoHighlightsFn = async (youtubeUrl: string, token: string): Promise<Highlight[]> => {
  const response = await apiClient.post(
    '/video/highlights',
    { youtubeUrl },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};
