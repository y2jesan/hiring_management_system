const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { auth } = require('../middlewares/auth');

// Validation middleware
const validateExperience = [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Experience name must be between 1 and 100 characters'), body('active').optional().isBoolean().withMessage('Active must be a boolean value')];

// All routes require authentication
router.use(auth);

// GET /api/experiences - Get all experiences
router.get('/', experienceController.getAllExperiences);

// GET /api/experiences/:id - Get single experience
router.get('/:id', experienceController.getExperienceById);

// POST /api/experiences - Create new experience
router.post('/', validateExperience, experienceController.createExperience);

// PUT /api/experiences/:id - Update experience
router.put('/:id', validateExperience, experienceController.updateExperience);

// DELETE /api/experiences/:id - Delete experience
router.delete('/:id', experienceController.deleteExperience);

// PATCH /api/experiences/:id/toggle - Toggle experience status
router.patch('/:id/toggle', experienceController.toggleExperienceStatus);

module.exports = router;
