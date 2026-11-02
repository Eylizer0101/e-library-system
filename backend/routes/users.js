const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { fullName, contact, course, yearLevel, address } = req.body;
    
    if (String(req.user._id) !== String(req.params.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        contact,
        course, 
        yearLevel,
        address
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        contact: user.contact,
        course: user.course,
        yearLevel: user.yearLevel,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        contact: user.contact,
        course: user.course,
        yearLevel: user.yearLevel,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;