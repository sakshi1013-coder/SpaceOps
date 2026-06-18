const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

// Protected dashboard route
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

// Route / to /dashboard
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router;
