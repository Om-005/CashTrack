// ── Load environment variables first ──────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// ── Import route modules ─────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// ── Initialize Express app ───────────────────────────────────────────
const app = express();

// ── Connect to MongoDB ───────────────────────────────────────────────
connectDB();

// ── Global middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Mount API routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// ── Health-check endpoint ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'CashTrack API is running 🚀' });
});

// ── 404 handler for unknown routes ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler middleware ──────────────────────────────────
// Express identifies error-handling middleware by the 4-parameter signature.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('💥 Unhandled error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CashTrack server running on port ${PORT} (all interfaces)`);
});
