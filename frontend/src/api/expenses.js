import { apiClient } from '../context/AuthContext';

export const getExpenses = async (params = {}) => {
  const response = await apiClient.get('/expenses', { params });
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await apiClient.post('/expenses', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await apiClient.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await apiClient.delete(`/expenses/${id}`);
  return response.data;
};

export const getExpenseSummary = async () => {
  const response = await apiClient.get('/expenses/summary');
  return response.data;
};

export const getCategorySummary = async () => {
  const response = await apiClient.get('/expenses/category-summary');
  return response.data;
};
