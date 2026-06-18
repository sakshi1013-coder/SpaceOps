const express = require('express');
const router = express.Router();
const satelliteController = require('../controllers/satelliteController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// All authenticated roles (Admin, Manager, Operator) can view satellites
router.get('/', isAuthenticated, satelliteController.getAllSatellites);

// Write actions restricted to Admin and Manager roles
router.get('/create', isAuthenticated, authorizeRoles('Admin', 'Manager'), satelliteController.getCreateForm);
router.post('/create', isAuthenticated, authorizeRoles('Admin', 'Manager'), satelliteController.createSatellite);

router.get('/edit/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), satelliteController.getEditForm);
router.post('/edit/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), satelliteController.updateSatellite);

router.post('/delete/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), satelliteController.deleteSatellite);

module.exports = router;
