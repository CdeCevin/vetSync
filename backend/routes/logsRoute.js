const express = require('express');
const router = express.Router();
const verLogs = require('../controllers/Logs/verLogs');
const permitirRoles = require('../middleware/roleMiddleware');

// Solo ID Rol 1 (Admin) puede ver logs
router.get('/verLogs', permitirRoles(1), verLogs);

module.exports = router;
