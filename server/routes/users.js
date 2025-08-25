const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, superAdminOnly } = require('../middlewares/auth');

// Validation middleware
const validateCreateUser = [body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'), body('email').isEmail().withMessage('Please enter a valid email'), body('role').isIn(['HR', 'Evaluator', 'MD', 'Super Admin']).withMessage('Invalid role'), body('department').optional().isLength({ min: 2 }).withMessage('Department must be at least 2 characters long')];

const validateUpdateUser = [body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'), body('email').optional().isEmail().withMessage('Please enter a valid email'), body('role').optional().isIn(['HR', 'Evaluator', 'MD', 'Super Admin']).withMessage('Invalid role'), body('department').optional().isLength({ min: 2 }).withMessage('Department must be at least 2 characters long'), body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')];

// Protected routes (Super Admin only)
router.use(authenticateToken, superAdminOnly);

router.post('/', validateCreateUser, userController.createUser);
router.get('/', userController.getUsers);
router.get('/role/:role', userController.getUsersByRole);
router.get('/:id', userController.getUserById);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);
router.patch('/:id/reset-password', userController.resetUserPassword);

module.exports = router;
