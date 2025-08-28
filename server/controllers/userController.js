const User = require('../models/User');
const { createSuccessResponse, createErrorResponse, generatePagination, sanitizeSearchQuery } = require('../helpers/utils');

// Get all users with filters and pagination
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const role = req.query.role;
    const is_active = req.query.is_active;

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
    if (is_active !== undefined) {
      query.is_active = is_active === 'true';
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

    res.json(
      createSuccessResponse({
        users,
        pagination,
      })
    );
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

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(createErrorResponse('User with this email already exists'));
    }

    // Validate role permissions
    const currentUserRole = req.user.role;
    const allowedRoles = ['Super Admin', 'HR', 'MD'];
    
    if (!allowedRoles.includes(currentUserRole)) {
      return res.status(403).json(createErrorResponse('You do not have permission to create users'));
    }

    // Super Admin can create any role, others can only create HR and Evaluator
    if (currentUserRole !== 'Super Admin' && ['MD', 'Super Admin'].includes(role)) {
      return res.status(403).json(createErrorResponse('You can only create HR and Evaluator users'));
    }

    const userData = {
      name,
      email,
      password,
      role,
      department,
      created_by: req.user._id
    };

    const user = await User.create(userData);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(
      createSuccessResponse(
        { user: userResponse },
        'User created successfully'
      )
    );
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to create user'));
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, department, is_active } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Check permissions
    const currentUserRole = req.user.role;
    const allowedRoles = ['Super Admin', 'HR', 'MD'];
    
    if (!allowedRoles.includes(currentUserRole)) {
      return res.status(403).json(createErrorResponse('You do not have permission to update users'));
    }

    // Super Admin can update any user, others can only update HR and Evaluator
    if (currentUserRole !== 'Super Admin' && ['MD', 'Super Admin'].includes(user.role)) {
      return res.status(403).json(createErrorResponse('You can only update HR and Evaluator users'));
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(createErrorResponse('User with this email already exists'));
      }
    }

    // Validate role changes
    if (role && currentUserRole !== 'Super Admin' && ['MD', 'Super Admin'].includes(role)) {
      return res.status(403).json(createErrorResponse('You can only assign HR and Evaluator roles'));
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(
      createSuccessResponse(
        { user: updatedUser },
        'User updated successfully'
      )
    );
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to update user'));
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Check permissions
    const currentUserRole = req.user.role;
    const allowedRoles = ['Super Admin', 'HR', 'MD'];
    
    if (!allowedRoles.includes(currentUserRole)) {
      return res.status(403).json(createErrorResponse('You do not have permission to delete users'));
    }

    // Super Admin can delete any user, others can only delete HR and Evaluator
    if (currentUserRole !== 'Super Admin' && ['MD', 'Super Admin'].includes(user.role)) {
      return res.status(403).json(createErrorResponse('You can only delete HR and Evaluator users'));
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json(createErrorResponse('You cannot delete your own account'));
    }

    await User.findByIdAndDelete(id);

    res.json(
      createSuccessResponse(
        {},
        'User deleted successfully'
      )
    );
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(createErrorResponse('Failed to delete user'));
  }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    // Check permissions
    const currentUserRole = req.user.role;
    const allowedRoles = ['Super Admin', 'HR', 'MD'];
    
    if (!allowedRoles.includes(currentUserRole)) {
      return res.status(403).json(createErrorResponse('You do not have permission to toggle user status'));
    }

    // Super Admin can toggle any user, others can only toggle HR and Evaluator
    if (currentUserRole !== 'Super Admin' && ['MD', 'Super Admin'].includes(user.role)) {
      return res.status(403).json(createErrorResponse('You can only toggle HR and Evaluator users'));
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json(createErrorResponse('You cannot deactivate your own account'));
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { is_active: !user.is_active },
      { new: true }
    ).select('-password');

    res.json(
      createSuccessResponse(
        { user: updatedUser },
        `User ${updatedUser.is_active ? 'activated' : 'deactivated'} successfully`
      )
    );
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json(createErrorResponse('Failed to toggle user status'));
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(createSuccessResponse({ user }));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch user profile'));
  }
};

// Get evaluators for job assignment
const getEvaluators = async (req, res) => {
  try {
    const evaluators = await User.find({
      role: { $in: ['Evaluator', 'HR', 'MD', 'Super Admin'] },
      is_active: true
    })
    .select('_id name email role department')
    .sort({ name: 1 });

    res.json(createSuccessResponse({ evaluators }));
  } catch (error) {
    console.error('Get evaluators error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch evaluators'));
  }
};

// Update current user profile
const updateCurrentUser = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(createErrorResponse('User with this email already exists'));
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (department !== undefined) updateData.department = department;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(
      createSuccessResponse(
        { user: updatedUser },
        'Profile updated successfully'
      )
    );
  } catch (error) {
    console.error('Update current user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(createErrorResponse(errors.join(', ')));
    }
    res.status(500).json(createErrorResponse('Failed to update profile'));
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getEvaluators,
  getCurrentUser,
  updateCurrentUser,
};
