import axios from 'axios';

const API_URL = 'http://localhost:5000/api/study';

export const generateStudyMaterialsFn = async (documentId: string, token: string, sections: string[]) => {
  const response = await axios.post(
    `${API_URL}/generate`,
    { documentId, sections },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
};

export const fetchStudyDataFn = async (documentId: string, token: string) => {
  const response = await axios.get(`${API_URL}/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
