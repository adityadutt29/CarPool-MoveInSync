const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();
const { JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Driver or Rider)
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, role, showFullName, blurProfile, gender, smokingAllowed, petAllowed } = req.body;
    if (!fullName || !email || !password) {
      const err = new Error('fullName, email, and password are required.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('Email already registered.');
      err.statusCode = 400;
      err.code = 'USER_EXISTS';
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const displayName = fullName.trim().split(' ')[0];

    const newUser = new User({
      fullName,
      displayName,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'rider',
      showFullName: !!showFullName,
      blurProfile: !!blurProfile,
      gender: gender || 'other',
      smokingAllowed: smokingAllowed != null ? smokingAllowed : true,
      petAllowed: petAllowed != null ? petAllowed : true
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error('Email and password are required.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new Error('Invalid credentials.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const err = new Error('Invalid credentials.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        displayName: user.displayName,
        email: user.email,
        showFullName: user.showFullName,
        blurProfile: user.blurProfile,
        gender: user.gender,
        smokingAllowed: user.smokingAllowed,
        petAllowed: user.petAllowed,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;