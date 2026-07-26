import axios from 'axios';

const API_URL = 'http://localhost:5001/api/calendar';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  color: string;
  createdAt: string;
}

export const fetchEventsFn = async (token: string, month?: number, year?: number): Promise<CalendarEvent[]> => {
  const params = month && year ? { month, year } : {};
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data.data;
};

export const createEventFn = async (
  token: string,
  data: { title: string; description?: string; date: string; color?: string }
): Promise<CalendarEvent> => {
  const response = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const updateEventFn = async (
  token: string,
  id: string,
  data: Partial<{ title: string; description: string; date: string; color: string }>
): Promise<CalendarEvent> => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

export const deleteEventFn = async (token: string, id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
