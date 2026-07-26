import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chat';

export const sendChatMessage = async (
  content: string,
  token: string,
  documentId?: string,
  chatId?: string,
  parentId?: string
) => {
  const response = await axios.post(
    `${API_URL}/message`,
    { content, documentId, chatId, parentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getUserChatsFn = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const getChatHistoryFn = async (chatId: string, token: string) => {
  const response = await axios.get(`${API_URL}/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
