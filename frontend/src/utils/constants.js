/**
 * CashTrack — Application Constants
 * Premium dark fintech theme with Stripe-inspired palette.
 */

// ─── Expense Categories ───────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',   emoji: '🍽️', color: '#e8c96a' },
  { id: 'transport',     name: 'Transport',       emoji: '🚗', color: '#4ecdc4' },
  { id: 'shopping',      name: 'Shopping',        emoji: '🛍️', color: '#5b8dee' },
  { id: 'entertainment', name: 'Entertainment',   emoji: '🎬', color: '#9b6dff' },
  { id: 'health',        name: 'Health',          emoji: '💊', color: '#f5a623' },
  { id: 'utilities',     name: 'Utilities',       emoji: '💡', color: '#c9a84c' },
  { id: 'education',     name: 'Education',       emoji: '📚', color: '#e05c5c' },
  { id: 'other',         name: 'Other',           emoji: '📦', color: '#6b6f84' },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
];

// ─── Premium Theme Colors ─────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  background:    '#080B1A',
  surface:       '#111638',
  surfaceLight:  '#1B2150',

  // Borders
  cardBorder:    'rgba(99,130,255,0.15)',

  // Brand
  primary:       '#635BFF',
  primaryLight:  '#8B83FF',
  secondary:     '#00D4AA',
  accent:        '#FF6B8A',

  // Gradients
  gradient1:     '#635BFF',
  gradient2:     '#00D4AA',
  gradientPink:  '#FF6B8A',

  // Text
  text:          '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary:  'rgba(255,255,255,0.35)',

  // Status
  success:       '#00E676',
  danger:        '#FF4757',
  warning:       '#FFBE0B',

  // Inputs
  inputBg:       'rgba(255,255,255,0.04)',
  inputBorder:   'rgba(255,255,255,0.08)',

  // Legacy alias
  card:          '#111638',
};

// ─── API Configuration ────────────────────────────────────────────────────────
export const API_URL = 'https://cashtrack-ajjp.onrender.com/api';