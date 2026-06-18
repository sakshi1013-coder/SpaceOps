const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { isAuthenticated } = require('../middleware/auth');

// All authenticated roles have full CRUD access to telemetry logs
router.get('/', isAuthenticated, telemetryController.getAllTelemetry);

router.get('/create', isAuthenticated, telemetryController.getCreateForm);
router.post('/create', isAuthenticated, telemetryController.createTelemetry);

router.get('/edit/:id', isAuthenticated, telemetryController.getEditForm);
router.post('/edit/:id', isAuthenticated, telemetryController.updateTelemetry);

router.post('/delete/:id', isAuthenticated, telemetryController.deleteTelemetry);

module.exports = router;
