/**
 * CashTrack — Auth Service
 * Handles login, registration, and profile fetching via the backend API.
 */

import api from './api';

/**
 * Authenticate a user with email + password.
 * @returns {{ user, token }} on success
 */
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

/**
 * Register a new user account.
 * @returns {{ user, token }} on success
 */
export const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

/**
 * Fetch the currently-authenticated user's profile.
 * @returns {{ user }} on success
 */
export const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};
