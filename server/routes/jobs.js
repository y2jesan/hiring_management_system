const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const { authenticateToken, hrAndAbove } = require('../middlewares/auth');
const { uploadImage, handleUploadError } = require('../middlewares/upload');

// Validation middleware
const validateJobCreate = [body('title').isLength({ min: 3 }).withMessage('Job title must be at least 3 characters long'), body('salary_range').isLength({ min: 1 }).withMessage('Salary range is required'), body('designation').isLength({ min: 2 }).withMessage('Designation is required'), body('job_description').isLength({ min: 10 }).withMessage('Job description must be at least 10 characters long'), body('experience_in_year').optional().isString().withMessage('Experience must be a string'), body('task_link').optional().isURL().withMessage('Task link must be a valid URL')];

const validateJobUpdate = [body('title').optional().isLength({ min: 3 }).withMessage('Job title must be at least 3 characters long'), body('salary_range').optional().isLength({ min: 1 }).withMessage('Salary range is required'), body('designation').optional().isLength({ min: 2 }).withMessage('Designation is required'), body('job_description').optional().isLength({ min: 10 }).withMessage('Job description must be at least 10 characters long'), body('experience_in_year').optional().isString().withMessage('Experience must be a string'), body('task_link').optional().isURL().withMessage('Task link must be a valid URL'), body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')];

// Public routes
router.get('/active', jobController.getActiveJobs);
router.get('/public/:job_id', jobController.getJobByJobId);

// Protected routes (HR and above)
router.use(authenticateToken, hrAndAbove);

router.post('/', uploadImage.single('image'), handleUploadError, validateJobCreate, jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', uploadImage.single('image'), handleUploadError, validateJobUpdate, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.patch('/:id/toggle-status', jobController.toggleJobStatus);

module.exports = router;
