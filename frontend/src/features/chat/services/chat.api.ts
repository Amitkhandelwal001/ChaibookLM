import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

export const sendChatMessage = async (question: string, token: string, documentId?: string) => {
  const response = await axios.post(
    API_URL,
    { question, documentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
