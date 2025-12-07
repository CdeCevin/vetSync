const express = require('express');
const router = express.Router();
const agregarProcedimiento = require('../controllers/Procedimientos/agregarProcedimiento');
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');

router.use(verifyToken);

// Agregar procedimiento a un historial existente (Admin, Vet)
router.post('/procedimientos', permitirRoles(1, 2), agregarProcedimiento);

module.exports = router;
