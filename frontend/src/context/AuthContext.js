/**
 * CashTrack — Auth Context
 * Provides user, token, and auth actions (login, register, logout) to the
 * entire component tree via React Context + useReducer.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

// ─── State shape & initial values ─────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  loading: true,   // true while we check AsyncStorage on mount
  error: null,
};

// ─── Action types ─────────────────────────────────────────────────────────────
const AUTH_LOADING     = 'AUTH_LOADING';
const AUTH_SUCCESS     = 'AUTH_SUCCESS';
const AUTH_ERROR       = 'AUTH_ERROR';
const AUTH_LOGOUT      = 'AUTH_LOGOUT';
const CLEAR_ERROR      = 'CLEAR_ERROR';

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_LOADING:
      return { ...state, loading: true, error: null };
    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case AUTH_LOGOUT:
      return { ...initialState, loading: false };
    case CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Try to restore a saved session on app launch
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userJson = await AsyncStorage.getItem('user');
        if (token && userJson) {
          const user = JSON.parse(userJson);
          dispatch({ type: AUTH_SUCCESS, payload: { user, token } });
        } else {
          dispatch({ type: AUTH_LOGOUT });
        }
      } catch {
        dispatch({ type: AUTH_LOGOUT });
      }
    };
    loadUser();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_LOADING });
    try {
      const data = await authService.login(email, password);
      const { user, token } = data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: AUTH_SUCCESS, payload: { user, token } });
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message || 'Login failed' });
      throw err;
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    dispatch({ type: AUTH_LOADING });
    try {
      const data = await authService.register(name, email, password);
      const { user, token } = data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: AUTH_SUCCESS, payload: { user, token } });
    } catch (err) {
      dispatch({ type: AUTH_ERROR, payload: err.message || 'Registration failed' });
      throw err;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    dispatch({ type: AUTH_LOGOUT });
  }, []);

  // ── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: CLEAR_ERROR });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.token,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Convenience hook – throws if used outside AuthProvider. */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
