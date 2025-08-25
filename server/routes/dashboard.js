const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, hrAndAbove } = require('../middlewares/auth');

// Protected routes (HR and above)
router.use(authenticateToken, hrAndAbove);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/analytics', dashboardController.getAnalytics);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/export-candidates', dashboardController.exportCandidateData);

module.exports = router;
