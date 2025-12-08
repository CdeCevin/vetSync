const express = require('express');
const router = express.Router();
const agregarProcedimiento = require('../controllers/Procedimientos/agregarProcedimiento');
const editarProcedimiento = require('../controllers/Procedimientos/editarProcedimiento');
const eliminarProcedimiento = require('../controllers/Procedimientos/eliminarProcedimiento');
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');

router.use(verifyToken);

// Agregar procedimiento a un historial existente (Admin, Vet)
router.post('/procedimientos', permitirRoles(1, 2), agregarProcedimiento);

// Editar procedimiento (Admin, Vet)
router.put('/procedimientos/:id', permitirRoles(1, 2), editarProcedimiento);

// Eliminar procedimiento (Admin, Vet)
router.delete('/procedimientos/:id', permitirRoles(1, 2), eliminarProcedimiento);

module.exports = router;
