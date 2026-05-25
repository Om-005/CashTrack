/**
 * CashTrack — Axios API Instance
 * Configured with base URL, auth token interceptor, and error handling.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // AsyncStorage read failed — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalise errors ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'Something went wrong';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error — please check your connection'));
    }
    return Promise.reject(error);
  },
);

export default api;
