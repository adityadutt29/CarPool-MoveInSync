const express = require('express');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile (privacy & preferences)
 * @access  Private
 */
router.put('/me', auth, async (req, res, next) => {
  try {
    const updates = {};
    const { fullName, displayName, showFullName, blurProfile, gender, smokingAllowed, petAllowed } = req.body;
    if (fullName) updates.fullName = fullName;
    if (displayName) updates.displayName = displayName;
    if (showFullName != null) updates.showFullName = showFullName;
    if (blurProfile != null) updates.blurProfile = blurProfile;
    if (gender) updates.gender = gender;
    if (smokingAllowed != null) updates.smokingAllowed = smokingAllowed;
    if (petAllowed != null) updates.petAllowed = petAllowed;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    ).select('-passwordHash');

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;