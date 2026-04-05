const express = require('express');
const router = express.Router();
const { getWeeklyData, getMonthlyData, getCategoryBreakdown, getCategoryTrend, getAllCategories } = require('../controllers/chartsController');

// GET /api/charts/weekly
router.get('/weekly', getWeeklyData);

// GET /api/charts/monthly
router.get('/monthly', getMonthlyData);

// GET /api/charts/categories
router.get('/categories', getCategoryBreakdown);

// GET /api/charts/category-trend?category=Food
router.get('/category-trend', getCategoryTrend);

// GET /api/charts/all-categories
router.get('/all-categories', getAllCategories);

module.exports = router;
