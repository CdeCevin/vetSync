const express = require('express');
const router = express.Router();
const crearHistorial = require('../controllers/Historial/crearHistorial');
const verHistorialDetalle = require('../controllers/Historial/verHistorialDetalle');
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');

// Validar token en todas las rutas de historial
router.use(verifyToken);

// Solo veterinarios (rol 2) y admins (rol 1) pueden crear historial
router.post('/historial', permitirRoles(1, 2), crearHistorial);

// Ver detalle de historial (Admin, Vet, Recepcionista?)
// Asumo Rol 1, 2, 3 accesos.
router.get('/historial/:id', permitirRoles(1, 2, 3), verHistorialDetalle);

module.exports = router;
