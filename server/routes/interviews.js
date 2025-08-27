const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const interviewController = require('../controllers/interviewController');
const { authenticateToken, hrAndAbove } = require('../middlewares/auth');

// Validation middleware
const validateScheduleInterview = [body('candidate_id').isMongoId().withMessage('Valid candidate ID is required'), body('job_id').isMongoId().withMessage('Valid job ID is required'), body('scheduled_date').isISO8601().withMessage('Valid scheduled date is required'), body('interviewer').isMongoId().withMessage('Valid interviewer ID is required'), body('location').optional().isIn(['Online', 'In-Person']).withMessage('Location must be either Online or In-Person'), body('meeting_link').optional().isURL().withMessage('Meeting link must be a valid URL'), body('notes').optional().isLength({ min: 1 }).withMessage('Notes must not be empty')];

const validateUpdateResult = [body('result').isIn(['Pending', 'Rescheduled', 'Taken', 'Passed', 'Failed', 'No Show', 'Cancelled']).withMessage('Invalid interview result'), body('feedback').optional().isLength({ min: 1 }).withMessage('Feedback must not be empty'), body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100')];

const validateReschedule = [body('scheduled_date').isISO8601().withMessage('Valid scheduled date is required'), body('notes').optional().isLength({ min: 1 }).withMessage('Notes must not be empty')];

const validateCancel = [
  body('feedback').optional().isLength({ min: 1 }).withMessage('Feedback must not be empty'),
  body('notes').optional().isLength({ min: 1 }).withMessage('Notes must not be empty'),
  body('candidateStatus').isIn(['Interview Eligible', 'Interview Scheduled', 'Interview Completed', 'Shortlisted', 'Selected', 'Rejected']).withMessage('Invalid candidate status')
];

const validateComplete = [
  body('candidate_id').isMongoId().withMessage('Valid candidate ID is required'),
  body('candidateStatus').isIn(['Interview Completed', 'Shortlisted']).withMessage('Invalid candidate status'),
  body('interviewResult').isIn(['Taken', 'Passed', 'Failed', 'No Show', 'Cancelled']).withMessage('Invalid interview result'),
  body('interviewStatus').isIn(['Taken', 'Passed', 'Failed', 'No Show', 'Cancelled']).withMessage('Invalid interview status'),
  body('feedback').optional().isLength({ min: 1 }).withMessage('Feedback must not be empty'),
  body('notes').optional().isLength({ min: 1 }).withMessage('Notes must not be empty')
];

// Protected routes (HR and above)
router.use(authenticateToken, hrAndAbove);

router.post('/schedule', validateScheduleInterview, interviewController.scheduleInterview);
router.post('/schedule-next', validateScheduleInterview, interviewController.scheduleNextInterview);
router.get('/', interviewController.getInterviews);
router.get('/upcoming', interviewController.getUpcomingInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id/result', validateUpdateResult, interviewController.updateInterviewResult);
router.put('/:id/reschedule', validateReschedule, interviewController.rescheduleInterview);
router.put('/:id/cancel', validateCancel, interviewController.cancelInterview);
router.put('/:id/complete', validateComplete, interviewController.completeInterview);
router.get('/candidate/:candidate_id', interviewController.getInterviewsByCandidate);

module.exports = router;
