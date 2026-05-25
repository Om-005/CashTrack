const mongoose = require('mongoose');

// ── Allowed enum values ───────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Utilities',
  'Education',
  'Other',
];

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
];

const RECURRING_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

/**
 * Expense Schema
 * Each expense is scoped to a user via userId.
 */
const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  category: {
    type: String,
    enum: {
      values: EXPENSE_CATEGORIES,
      message: '{VALUE} is not a valid category',
    },
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  paymentMethod: {
    type: String,
    enum: {
      values: PAYMENT_METHODS,
      message: '{VALUE} is not a valid payment method',
    },
    required: [true, 'Payment method is required'],
  },
  notes: {
    type: String,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: {
      values: RECURRING_FREQUENCIES,
      message: '{VALUE} is not a valid frequency',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ── Compound index for efficient per-user date-sorted queries ─────────
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
