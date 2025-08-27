const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const candidateController = require('../controllers/candidateController');
const { authenticateToken, evaluatorAndAbove } = require('../middlewares/auth');
const { uploadCV, handleUploadError } = require('../middlewares/upload');

// Validation middleware
const validateApplication = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone')
    .isLength({ min: 11, max: 11 })
    .withMessage('Phone number must be exactly 11 digits')
    .matches(/^01\d{9}$/)
    .withMessage('Phone number must start with 01 and be exactly 11 digits'),
  body('years_of_experience').isFloat({ min: 0 }).withMessage('Years of experience must be a positive number'),
  body('expected_salary').isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('notice_period_in_months').isInt({ min: 0 }).withMessage('Notice period must be a positive integer'),
  body('core_experience').isArray({ min: 1 }).withMessage('At least one core experience is required'),
  body('core_experience.*').isLength({ min: 1 }).withMessage('Core experience items cannot be empty'),
];

const validateTaskSubmission = [body('links').isArray({ min: 1, max: 10 }).withMessage('At least one link is required, maximum 10 links allowed'), body('links.*.url').isURL().withMessage('Each link must be a valid URL'), body('links.*.type').optional().isIn(['github', 'live', 'other']).withMessage('Link type must be github, live, or other')];

const validateEvaluation = [body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'), body('comments').optional().isLength({ min: 1 }).withMessage('Comments must not be empty')];

const validateStatusUpdate = [body('status').isIn(['Applied', 'Task Pending', 'Task Submitted', 'Under Review', 'Interview Eligible', 'Interview Scheduled', 'Interview Completed', 'Shortlisted', 'Selected', 'Rejected']).withMessage('Invalid status')];

const validateFinalSelection = [body('selected').isBoolean().withMessage('Selected must be a boolean'), body('offer_letter_path').optional().isLength({ min: 1 }).withMessage('Offer letter path must not be empty')];

const validateCandidateUpdate = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phone')
    .optional()
    .matches(/^01\d{9}$/)
    .withMessage('Phone number must start with 01 and be exactly 11 digits'),
  body('status').optional().isIn(['Applied', 'Task Pending', 'Task Submitted', 'Under Review', 'Interview Eligible', 'Interview Scheduled', 'Interview Completed', 'Shortlisted', 'Selected', 'Rejected']).withMessage('Invalid status'),
  body('reference').optional().isMongoId().withMessage('Invalid reference user ID'),
  body('job_id').optional().isMongoId().withMessage('Invalid job ID'),
  body('years_of_experience').optional().isFloat({ min: 0 }).withMessage('Years of experience must be a positive number'),
  body('expected_salary').optional().isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
  body('notice_period_in_months').optional().isInt({ min: 0 }).withMessage('Notice period must be a positive integer'),
  body('core_experience')
    .optional()
    .custom((value) => {
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error('Core experience must be an array');
      }
      if (Array.isArray(value) && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          if (!value[i] || value[i].trim().length === 0) {
            throw new Error('Core experience items cannot be empty');
          }
        }
      }
      return true;
    }),
];

// Public routes
router.post('/apply/:job_id', uploadCV.single('cv'), handleUploadError, validateApplication, candidateController.applyForJob);
router.get('/application/:application_id', candidateController.getCandidateByApplicationId);
router.post('/application/:application_id/submit-task', validateTaskSubmission, candidateController.submitTask);

// Protected routes (Evaluator and above)
router.use(authenticateToken, evaluatorAndAbove);

router.get('/', candidateController.getCandidates);
router.get('/export', candidateController.exportCandidates);
router.get('/:id', candidateController.getCandidateById);
router.post('/:id/evaluate', validateEvaluation, candidateController.evaluateCandidate);
router.patch('/:id/status', validateStatusUpdate, candidateController.updateCandidateStatus);
router.put('/:id', validateCandidateUpdate, candidateController.updateCandidate);
router.post('/:id/final-selection', validateFinalSelection, candidateController.finalSelection);
router.delete('/:id', candidateController.deleteCandidate);

module.exports = router;
