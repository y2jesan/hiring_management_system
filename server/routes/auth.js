const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

// Validation middleware
const validateAdminLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
];

const validateCandidateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('application_id').isLength({ min: 1 }).withMessage('Application ID is required')
];

const validateProfileUpdate = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('department').optional().isLength({ min: 2 }).withMessage('Department must be at least 2 characters long')
];

const validatePasswordChange = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/admin/login', validateAdminLogin, authController.adminLogin);
router.post('/candidate/login', validateCandidateLogin, authController.candidateLogin);

// Protected routes
router.get('/verify', authenticateToken, authController.verifyToken);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
