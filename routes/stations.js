const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

// All authenticated roles (Admin, Manager, Operator) can view ground stations
router.get('/', isAuthenticated, stationController.getAllStations);

// Write actions restricted to Admin and Manager roles
router.get('/create', isAuthenticated, authorizeRoles('Admin', 'Manager'), stationController.getCreateForm);
router.post('/create', isAuthenticated, authorizeRoles('Admin', 'Manager'), stationController.createStation);

router.get('/edit/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), stationController.getEditForm);
router.post('/edit/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), stationController.updateStation);

router.post('/delete/:id', isAuthenticated, authorizeRoles('Admin', 'Manager'), stationController.deleteStation);

module.exports = router;
