const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getDailyTrend,
  getYearlySummary,
  getDashboardStats,
  expenseValidation,
} = require('../controllers/expenseController');

// All expense routes are protected — apply auth middleware to every route
router.use(protect);

// ── CRUD ──────────────────────────────────────────────────────────────
router.post('/', expenseValidation, addExpense);
router.post('/missing', expenseValidation, addExpense);
router.get('/', getExpenses);

// ── Dashboard & Analytics (placed BEFORE /:id to avoid param conflicts)
router.get('/dashboard', getDashboardStats);
router.get('/analytics/monthly', getMonthlyAnalytics);
router.get('/analytics/category', getCategoryAnalytics);
router.get('/analytics/daily', getDailyTrend);
router.get('/analytics/yearly', getYearlySummary);

// ── Single expense by ID ──────────────────────────────────────────────
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
