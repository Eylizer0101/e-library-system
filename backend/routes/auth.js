const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Return useful, safe error messages without exposing database credentials or internals.
const sendAuthError = (res, error, action) => {
  console.error(`${action} error:`, error);
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Email or student ID already registered.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Please check the information you entered.' });
  }
  if (mongoose.connection.readyState !== 1 ||
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError' ||
      error.name === 'MongooseError') {
    return res.status(503).json({ message: 'Database is unavailable. Please check the backend MongoDB connection and try again.' });
  }
  return res.status(500).json({ message: `${action} could not be completed. Please check the backend server logs.` });
};

const ensureAuthServiceReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'Database is not connected. Please check MongoDB and try again.' });
    return false;
  }
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.error('Authentication configuration error: JWT_SECRET is missing.');
    res.status(503).json({ message: 'Authentication service is not configured. Please contact the administrator.' });
    return false;
  }
  return true;
};

// Register
router.post('/register', async (req, res) => {
  try {
    if (!ensureAuthServiceReady(res)) return;
    const { fullName, email, password, studentId, course, yearLevel } = req.body;

    if ([fullName, email, password, studentId, course, yearLevel].some(v => typeof v !== 'string' || !v.trim())) return res.status(400).json({ message: 'All fields are required.' });
    if (fullName.trim().length < 6 || /\d/.test(fullName)) return res.status(400).json({ message: 'Enter a valid full name.' });
    if (!/^\d{2}-\d{4}-\d{5,6}$/.test(studentId.trim())) return res.status(400).json({ message: 'Invalid Student ID format.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Invalid email address.' });
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return res.status(400).json({ message: 'Password must have 8 characters and a special character.' });
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedId = studentId.trim();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedId }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or student ID' 
      });
    }

    // Create user
    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      studentId: normalizedId,
      course,
      yearLevel
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        course: user.course,
        yearLevel: user.yearLevel,
        contact: user.contact || '', // ADD THIS LINE
        address: user.address || '', // ADD THIS LINE
        role: user.role
      }
    });
  } catch (error) {
    return sendAuthError(res, error, 'Registration');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    if (!ensureAuthServiceReady(res)) return;
    const { email, password } = req.body;

    // Find user
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Invalid credentials' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        course: user.course,
        yearLevel: user.yearLevel,
        contact: user.contact || '', // ADD THIS LINE
        address: user.address || '', // ADD THIS LINE
        role: user.role
      }
    });
  } catch (error) {
    return sendAuthError(res, error, 'Login');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        studentId: req.user.studentId,
        course: req.user.course,
        yearLevel: req.user.yearLevel,
        contact: req.user.contact || '', // ADD THIS LINE
        address: req.user.address || '', // ADD THIS LINE
        role: req.user.role
      }
    });
  } catch (error) {
    return sendAuthError(res, error, 'Profile');
  }
});

module.exports = router;