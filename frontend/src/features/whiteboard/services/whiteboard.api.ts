import axios from 'axios';

const API_URL = 'http://localhost:5000/api/whiteboard';

export const fetchWhiteboardsFn = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const fetchWhiteboardByIdFn = async (id: string, token: string) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const saveWhiteboardFn = async (title: string, data: any, token: string, id?: string) => {
  const response = await axios.post(
    API_URL,
    { title, data, id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
};
