const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const talentController = require('../controllers/talentController');
const { authenticateToken, hrAndAbove } = require('../middlewares/auth');
const { uploadCV, handleUploadError } = require('../middlewares/upload');

// Validation middleware
const validateTalentCreate = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^01\d{9}$/).withMessage('Phone number must be 11 digits starting with 01'),
  body('years_of_experience').isFloat({ min: 0 }).withMessage('Years of experience must be a positive number'),
  body('expected_salary').isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('notice_period_in_months').isInt({ min: 0 }).withMessage('Notice period must be a positive number'),
  body('current_employment_status').isBoolean().withMessage('Current employment status must be a boolean'),
  body('current_company_name').optional().isString().withMessage('Current company name must be a string'),
  body('core_experience').isArray({ min: 1 }).withMessage('At least one core experience is required'),
];

const validateTalentUpdate = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^01\d{9}$/).withMessage('Phone number must be 11 digits starting with 01'),
  body('years_of_experience').optional().isFloat({ min: 0 }).withMessage('Years of experience must be a positive number'),
  body('expected_salary').optional().isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('notice_period_in_months').optional().isInt({ min: 0 }).withMessage('Notice period must be a positive number'),
  body('current_employment_status').optional().isBoolean().withMessage('Current employment status must be a boolean'),
  body('current_company_name').optional().isString().withMessage('Current company name must be a string'),
  body('core_experience').optional().isArray({ min: 1 }).withMessage('At least one core experience is required'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
];

// Public routes
router.post('/', uploadCV.single('cv'), handleUploadError, validateTalentCreate, talentController.createTalent);
router.get('/public/:talent_pool_id', talentController.getTalentByTalentPoolId);

// Protected routes (HR and above)
router.use(authenticateToken, hrAndAbove);

router.get('/', talentController.getTalents);
router.get('/export', talentController.exportTalents);
router.get('/:id', talentController.getTalentById);
router.put('/:id', uploadCV.single('cv'), handleUploadError, validateTalentUpdate, talentController.updateTalent);
router.delete('/:id', talentController.deleteTalent);
router.patch('/:id/toggle-status', talentController.toggleTalentStatus);

module.exports = router;
