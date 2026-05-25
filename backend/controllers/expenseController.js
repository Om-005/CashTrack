const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// ── Shared validation rules for expense creation ──────────────────────
const expenseValidation = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Food & Dining',
      'Transport',
      'Shopping',
      'Entertainment',
      'Health',
      'Utilities',
      'Education',
      'Other',
    ])
    .withMessage('Invalid category'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'])
    .withMessage('Invalid payment method'),
];

// ── Helper: get today's date as YYYY-MM-DD string ─────────────────────
const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * @desc    Add a new expense (today's date only)
 * @route   POST /api/expenses
 * @access  Private
 */
const addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, description, amount, date, time, paymentMethod, notes, isRecurring, recurringFrequency } = req.body;

    // Note: Strict date enforcement removed to prevent timezone shift bugs.
    // Users can submit expenses for any local date using this endpoint.

    const expense = await Expense.create({
      userId: req.user.id,
      category,
      description,
      amount,
      date,
      time,
      paymentMethod,
      notes: notes || '',
      isRecurring: isRecurring || false,
      recurringFrequency,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error('addExpense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



/**
 * @desc    Get all expenses for the authenticated user with filtering & search
 * @route   GET /api/expenses
 * @access  Private
 */
const getExpenses = async (req, res) => {
  try {
    const { category, month, year, search } = req.query;

    // Base filter: always scoped to the authenticated user
    const filter = { userId: req.user.id };

    // Optional category filter
    if (category) {
      filter.category = category;
    }

    // Optional month/year date-range filter
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = new Date(y, m - 1, 1); // first day of month
      const endDate = new Date(y, m, 1);        // first day of next month
      filter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const y = parseInt(year, 10);
      filter.date = {
        $gte: new Date(y, 0, 1),
        $lt: new Date(y + 1, 0, 1),
      };
    }

    // Optional search on description (case-insensitive regex)
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    console.error('getExpenses error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get a single expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({ success: true, expense });
  } catch (error) {
    console.error('getExpenseById error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Update only the fields that are provided
    const updatableFields = [
      'category', 'description', 'amount', 'date', 'time',
      'paymentMethod', 'notes', 'isRecurring', 'recurringFrequency',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    const updatedExpense = await expense.save();

    res.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.error('updateExpense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('deleteExpense error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Monthly analytics — total spending per month for a given year
 * @route   GET /api/expenses/analytics/monthly
 * @access  Private
 */
const getMonthlyAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const analytics = await Expense.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    res.json({ success: true, year, analytics });
  } catch (error) {
    console.error('getMonthlyAnalytics error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Category analytics — total & count per category for a given month/year
 * @route   GET /api/expenses/analytics/category
 * @access  Private
 */
const getCategoryAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const analytics = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    res.json({ success: true, year, month, analytics });
  } catch (error) {
    console.error('getCategoryAnalytics error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Daily trend — daily totals for the last 7 days
 * @route   GET /api/expenses/analytics/daily
 * @access  Private
 */
const getDailyTrend = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Compute the start of the day 6 days ago (7-day window including today)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const analytics = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sevenDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('getDailyTrend error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Yearly summary — total spending per year
 * @route   GET /api/expenses/analytics/yearly
 * @access  Private
 */
const getYearlySummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const analytics = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { year: { $year: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('getYearlySummary error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Dashboard stats — monthly total, yearly total, top category,
 *          avg daily spending (current month), recent 5 transactions
 * @route   GET /api/expenses/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 1);
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    // Run independent aggregations in parallel for performance
    const [
      monthlyTotalResult,
      yearlyTotalResult,
      topCategoryResult,
      recentTransactions,
    ] = await Promise.all([
      // 1. Total spending this month
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // 2. Total spending this year
      Expense.aggregate([
        { $match: { userId, date: { $gte: yearStart, $lt: yearEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // 3. Top category this month
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lt: monthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),
      // 4. Last 5 transactions
      Expense.find({ userId: req.user.id })
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
    ]);

    const monthlyTotal = monthlyTotalResult.length > 0
      ? Math.round(monthlyTotalResult[0].total * 100) / 100
      : 0;

    const yearlyTotal = yearlyTotalResult.length > 0
      ? Math.round(yearlyTotalResult[0].total * 100) / 100
      : 0;

    const topCategory = topCategoryResult.length > 0
      ? {
          category: topCategoryResult[0]._id,
          total: Math.round(topCategoryResult[0].total * 100) / 100,
        }
      : null;

    // Average daily spending = monthlyTotal / days elapsed so far this month
    const dayOfMonth = now.getDate();
    const avgDailySpending = dayOfMonth > 0
      ? Math.round((monthlyTotal / dayOfMonth) * 100) / 100
      : 0;

    res.json({
      success: true,
      stats: {
        monthlyTotal,
        yearlyTotal,
        topCategory,
        avgDailySpending,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
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
};
