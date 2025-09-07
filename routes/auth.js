const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if needed
require('dotenv').config();

const SALT_ROUNDS = 12; // secure, production-friendly

// Helper: remove sensitive fields before sending user object
function sanitizeUser(user) {
  if (!user) return null;
  const { password, __v, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Optional: password strength check (simple)
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = new User({ name, email, password: hashed });
    await user.save();

    return res.status(201).json({ message: 'User created', user: sanitizeUser(user) });
  } catch (err) {
    // Handle duplicate key error from Mongo (race condition)
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    // Create JWT
    const payload = { id: user._id, email: user.email };
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

    // Set cookie (httpOnly)
    const maxAgeMs = (() => {
      // rough conversion: '7d' -> 7 days; if JWT_EXPIRES_IN is a number or '1h' this is best-effort
      if (expiresIn.endsWith && expiresIn.endsWith('d')) {
        const days = parseInt(expiresIn.slice(0, -1), 10) || 7;
        return days * 24 * 60 * 60 * 1000;
      }
      // fallback to 7 days
      return 7 * 24 * 60 * 60 * 1000;
    })();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeMs
    });

    return res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// LOGOUT (clear cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out' });
});

module.exports = router;
