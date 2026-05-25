/**
 * CashTrack — Expense Service
 * All expense-related CRUD operations and analytics fetchers.
 */

import api from './api';

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const addExpense = async (data) => {
  const res = await api.post('/expenses', data);
  return res.data;
};



export const getExpenses = async (filters = {}) => {
  const res = await api.get('/expenses', { params: filters });
  return res.data;
};

export const getExpenseById = async (id) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

export const updateExpense = async (id, data) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

// ─── Analytics & Aggregations ─────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const res = await api.get('/expenses/dashboard');
  return res.data;
};

export const getMonthlyAnalytics = async (year) => {
  const res = await api.get('/expenses/analytics/monthly', { params: { year } });
  return res.data;
};

export const getCategoryAnalytics = async (month, year) => {
  const res = await api.get('/expenses/analytics/category', { params: { month, year } });
  return res.data;
};

export const getDailyTrend = async () => {
  const res = await api.get('/expenses/analytics/daily');
  return res.data;
};

export const getYearlySummary = async () => {
  const res = await api.get('/expenses/analytics/yearly');
  return res.data;
};
