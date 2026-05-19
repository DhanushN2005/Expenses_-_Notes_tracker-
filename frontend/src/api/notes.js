import { apiClient } from '../context/AuthContext';

export const getNotes = async () => {
  const response = await apiClient.get('/notes');
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await apiClient.post('/notes', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await apiClient.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await apiClient.delete(`/notes/${id}`);
  return response.data;
};
