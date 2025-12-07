const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');

// Middleware de autenticación global para estas rutas
router.use(verifyToken);

// Importar controladores (atención a exportaciones nombradas vs default)
const verTratamientos = require('../controllers/Tratamientos/verTratamientos.js');
const { agregarTratamiento } = require('../controllers/Tratamientos/agregarTratamiento.js');
const { editarTratamiento } = require('../controllers/Tratamientos/editarTratamiento.js');
const { eliminarTratamiento } = require('../controllers/Tratamientos/eliminarTratamiento.js');

// Rutas
// GET /api/:idClinica/tratamientos/:idPaciente - Ver tratamientos de un paciente
router.get('/tratamientos/:idPaciente', verTratamientos);

// POST /api/:idClinica/tratamientos - Agregar nuevo tratamiento
router.post('/tratamientos', agregarTratamiento);

// PUT /api/:idClinica/tratamientos/:id - Editar tratamiento existente
router.put('/tratamientos/:id', editarTratamiento);

// DELETE /api/:idClinica/tratamientos/:id - Desactivar (Cancelar) tratamiento
router.delete('/tratamientos/:id', eliminarTratamiento);

module.exports = router;
