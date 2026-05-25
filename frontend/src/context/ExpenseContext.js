/**
 * CashTrack — Expense Context
 * Centralised expense state: list, dashboard stats, and CRUD actions.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import * as expenseService from '../services/expenseService';

// ─── State shape ──────────────────────────────────────────────────────────────
const initialState = {
  expenses: [],
  dashboardStats: null,
  loading: false,
  error: null,
};

// ─── Action types ─────────────────────────────────────────────────────────────
const SET_LOADING     = 'SET_LOADING';
const SET_EXPENSES    = 'SET_EXPENSES';
const SET_DASHBOARD   = 'SET_DASHBOARD';
const ADD_EXPENSE     = 'ADD_EXPENSE';
const UPDATE_EXPENSE  = 'UPDATE_EXPENSE';
const DELETE_EXPENSE  = 'DELETE_EXPENSE';
const SET_ERROR       = 'SET_ERROR';
const CLEAR_ERROR     = 'CLEAR_ERROR';

// ─── Reducer ──────────────────────────────────────────────────────────────────
const expenseReducer = (state, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: true, error: null };
    case SET_EXPENSES:
      return { ...state, loading: false, expenses: action.payload, error: null };
    case SET_DASHBOARD:
      return { ...state, loading: false, dashboardStats: action.payload, error: null };
    case ADD_EXPENSE:
      return {
        ...state,
        loading: false,
        expenses: [action.payload, ...state.expenses],
      };
    case UPDATE_EXPENSE:
      return {
        ...state,
        loading: false,
        expenses: state.expenses.map((e) =>
          (e._id || e.id) === (action.payload._id || action.payload.id)
            ? action.payload
            : e,
        ),
      };
    case DELETE_EXPENSE:
      return {
        ...state,
        loading: false,
        expenses: state.expenses.filter(
          (e) => (e._id || e.id) !== action.payload,
        ),
      };
    case SET_ERROR:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ExpenseContext = createContext(undefined);

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // ── Fetch all expenses (with optional filters) ────────────────────────────
  const fetchExpenses = useCallback(async (filters) => {
    dispatch({ type: SET_LOADING });
    try {
      const data = await expenseService.getExpenses(filters);
      dispatch({ type: SET_EXPENSES, payload: data.expenses || data });
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.message });
    }
  }, []);

  // ── Fetch dashboard stats ─────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    dispatch({ type: SET_LOADING });
    try {
      const data = await expenseService.getDashboardStats();
      dispatch({ type: SET_DASHBOARD, payload: data });
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.message });
    }
  }, []);

  // ── Add expense ───────────────────────────────────────────────────────────
  const addExpense = useCallback(async (expenseData) => {
    dispatch({ type: SET_LOADING });
    try {
      const data = await expenseService.addExpense(expenseData);
      dispatch({ type: ADD_EXPENSE, payload: data.expense || data });
      return data;
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.message });
      throw err;
    }
  }, []);



  // ── Update expense ────────────────────────────────────────────────────────
  const updateExpense = useCallback(async (id, expenseData) => {
    dispatch({ type: SET_LOADING });
    try {
      const data = await expenseService.updateExpense(id, expenseData);
      dispatch({ type: UPDATE_EXPENSE, payload: data.expense || data });
      return data;
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.message });
      throw err;
    }
  }, []);

  // ── Delete expense ────────────────────────────────────────────────────────
  const deleteExpense = useCallback(async (id) => {
    dispatch({ type: SET_LOADING });
    try {
      await expenseService.deleteExpense(id);
      dispatch({ type: DELETE_EXPENSE, payload: id });
    } catch (err) {
      dispatch({ type: SET_ERROR, payload: err.message });
      throw err;
    }
  }, []);

  // ── Clear error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: CLEAR_ERROR });
  }, []);

  const value = {
    expenses: state.expenses,
    dashboardStats: state.dashboardStats,
    loading: state.loading,
    error: state.error,
    fetchExpenses,
    fetchDashboard,
    addExpense,
    updateExpense,
    deleteExpense,
    clearError,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

/** Convenience hook – throws if used outside ExpenseProvider. */
export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within an ExpenseProvider');
  return ctx;
};

export default ExpenseContext;
