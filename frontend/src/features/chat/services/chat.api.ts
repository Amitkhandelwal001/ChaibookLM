import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chat';

export const sendChatMessage = async (
  question: string, 
  token: string, 
  documentId?: string,
  chatId?: string,
  parentMessageId?: string
) => {
  const response = await axios.post(
    API_URL,
    { question, documentId, chatId, parentMessageId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchUserChatsFn = async (token: string) => {
  const response = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data.chats;
};

export const fetchChatTreeFn = async (chatId: string, token: string) => {
  const response = await axios.get(`${API_URL}/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
