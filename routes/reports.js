const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');

// Protected reports route
router.get('/', isAuthenticated, reportController.getReports);

module.exports = router;
