const express = require('express');
const router = express.Router();
const { getStats, getRecent } = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', getStats);

// GET /api/dashboard/recent
router.get('/recent', getRecent);

module.exports = router;
