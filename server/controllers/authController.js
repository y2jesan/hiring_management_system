const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { createSuccessResponse, createErrorResponse } = require('../helpers/utils');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Admin/HR/MD Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse('Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json(createErrorResponse('Account is deactivated'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(createErrorResponse('Invalid credentials'));
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      last_login: user.last_login,
    };

    res.json(
      createSuccessResponse(
        {
          user: userResponse,
          token,
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json(createErrorResponse('Login failed'));
  }
};

// Candidate Login (Email + Application ID)
const candidateLogin = async (req, res) => {
  try {
    const { email, application_id } = req.body;

    if (!email || !application_id) {
      return res.status(400).json(createErrorResponse('Email and Application ID are required'));
    }

    // Find candidate by email and application ID
    const candidate = await Candidate.findOne({
      email: email.toLowerCase(),
      application_id,
    }).populate('job_id', 'title designation');

    if (!candidate) {
      return res.status(401).json(createErrorResponse('Invalid email or Application ID'));
    }

    // Generate temporary token for candidate (shorter expiry)
    const token = jwt.sign(
      {
        candidateId: candidate._id,
        applicationId: candidate.application_id,
        type: 'candidate',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const candidateResponse = {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      application_id: candidate.application_id,
      status: candidate.status,
      job: candidate.job_id,
    };

    res.json(
      createSuccessResponse(
        {
          candidate: candidateResponse,
          token,
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('Candidate login error:', error);
    res.status(500).json(createErrorResponse('Login failed'));
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(createSuccessResponse({ user }));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createErrorResponse('Failed to get profile'));
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (department) updateData.department = department;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select('-password');

    res.json(createSuccessResponse({ user }, 'Profile updated successfully'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createErrorResponse('Failed to update profile'));
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(createErrorResponse('Current password and new password are required'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(createErrorResponse('New password must be at least 6 characters long'));
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(createErrorResponse('Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json(createSuccessResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(createErrorResponse('Failed to change password'));
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    res.json(createSuccessResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(createErrorResponse('Logout failed'));
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    res.json(createSuccessResponse({ valid: true }));
  } catch (error) {
    res.status(401).json(createErrorResponse('Invalid token'));
  }
};

module.exports = {
  adminLogin,
  candidateLogin,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
};
