const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');

// ── Public routes ─────────────────────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// ── Protected routes ──────────────────────────────────────────────────
router.get('/profile', protect, getProfile);

module.exports = router;
