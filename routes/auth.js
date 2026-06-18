const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/auth');

// Guest-only routes
router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authController.postLogin);

// Protected logout route
router.get('/logout', isAuthenticated, authController.logout);
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
