const express = require('express');
const router = express.Router();
const crearHistorial = require('../controllers/Historial/crearHistorial');
const verHistorialDetalle = require('../controllers/Historial/verHistorialDetalle');
const buscarHistorial = require('../controllers/Historial/buscarHistorial');
const editarHistorial = require('../controllers/Historial/editarHistorial');
const eliminarHistorial = require('../controllers/Historial/eliminarHistorial');
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');

// Validar token en todas las rutas de historial
router.use(verifyToken);

// Solo veterinarios (rol 2) y admins (rol 1) pueden crear historial
router.post('/historial', permitirRoles(1, 2), crearHistorial);

// Búsqueda de Historial (Poner antes de otras rutas GET genéricas para evitar colisiones)
router.get('/historial/buscar', permitirRoles(1, 2, 3), buscarHistorial);

// Editar historial (Diagnóstico/Notas)
router.put('/historial/:id', permitirRoles(1, 2), editarHistorial);

// Eliminar historial (Soft Delete)
router.delete('/historial/:id', permitirRoles(1, 2), eliminarHistorial);

// Ver Listado de Historiales (Últimos 50)
router.get('/historial', permitirRoles(1, 2, 3), verHistorialDetalle);

module.exports = router;
