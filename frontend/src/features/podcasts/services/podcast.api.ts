import axios from 'axios';

const API_URL = 'http://localhost:5000/api/podcast';

export const fetchPodcastsFn = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.podcasts;
};

export const generatePodcastFn = async (documentId: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/generate`,
    { documentId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data.podcast;
};
