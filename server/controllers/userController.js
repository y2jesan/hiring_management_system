const User = require('../models/User');
const { 
  createSuccessResponse, 
  createErrorResponse,
  generatePagination,
  sanitizeSearchQuery,
  generateRandomPassword
} = require('../helpers/utils');

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json(createErrorResponse('User with this email already exists'));
    }

    // Generate random password
    const password = generateRandomPassword();

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      department
    };

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      is_active: user.is_active,
      created_at: user.createdAt
    };

    res.status(201).json(createSuccessResponse({
      user: userResponse,
      password // Include password in response for admin to share with user
    }, 'User created successfully'));

  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to create user'));
  }
};

// Get all users with pagination and filters
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const role = req.query.role;
    const isActive = req.query.is_active;

    const query = {};

    // Search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchQuery(search);
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
        { department: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.is_active = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    const pagination = generatePagination(page, limit, total);

    res.json(createSuccessResponse({
      users,
      pagination
    }));

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch users'));
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse({ user }));
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch user'));
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, is_active } = req.body;
    const { id } = req.params;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Check email uniqueness if being updated
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json(createErrorResponse('User with this email already exists'));
      }
      updateData.email = email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse({ user }, 'User updated successfully'));
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to update user'));
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user._id.toString()) {
      return res.status(400).json(createErrorResponse('Cannot delete your own account'));
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse(null, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(createErrorResponse('Failed to delete user'));
  }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating own account
    if (id === req.user._id.toString()) {
      return res.status(400).json(createErrorResponse('Cannot deactivate your own account'));
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    user.is_active = !user.is_active;
    await user.save();

    res.json(createSuccessResponse({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        is_active: user.is_active
      }
    }, `User ${user.is_active ? 'activated' : 'deactivated'} successfully`));

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json(createErrorResponse('Failed to toggle user status'));
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    user.password = newPassword;
    await user.save();

    res.json(createSuccessResponse({
      password: newPassword
    }, 'Password reset successfully'));

  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json(createErrorResponse('Failed to reset password'));
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const users = await User.find({ 
      role, 
      is_active: true 
    })
      .select('name email department')
      .sort({ name: 1 });

    res.json(createSuccessResponse({ users }));
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch users'));
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUsersByRole
};
