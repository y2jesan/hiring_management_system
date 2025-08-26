const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { getUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus, getCurrentUser, updateCurrentUser } = require('../controllers/userController');

// Apply authentication middleware to all routes
router.use(auth);

// Get current user profile
router.get('/profile', getCurrentUser);

// Update current user profile
router.put('/profile', updateCurrentUser);

// Get all users (requires HR, MD, or Super Admin role)
router.get('/', authorize(['HR', 'MD', 'Super Admin']), getUsers);

// Get user by ID (requires HR, MD, or Super Admin role)
router.get('/:id', authorize(['HR', 'MD', 'Super Admin']), getUserById);

// Create new user (requires HR, MD, or Super Admin role)
router.post('/', authorize(['HR', 'MD', 'Super Admin']), createUser);

// Update user (requires HR, MD, or Super Admin role)
router.put('/:id', authorize(['HR', 'MD', 'Super Admin']), updateUser);

// Delete user (requires HR, MD, or Super Admin role)
router.delete('/:id', authorize(['HR', 'MD', 'Super Admin']), deleteUser);

// Toggle user status (requires HR, MD, or Super Admin role)
router.patch('/:id/toggle-status', authorize(['HR', 'MD', 'Super Admin']), toggleUserStatus);

module.exports = router;
