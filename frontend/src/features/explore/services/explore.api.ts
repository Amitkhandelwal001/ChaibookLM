import axios from 'axios';

const API_URL = 'http://localhost:5000/api/search';

export const globalSearchFn = async (query: string, token: string) => {
  const response = await axios.get(API_URL, {
    params: { q: query },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.results;
};

export const fetchKnowledgeGraphFn = async (token: string) => {
  const response = await axios.get(`${API_URL}/graph`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
