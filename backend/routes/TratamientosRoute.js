const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');

// Middleware de autenticación global para estas rutas
router.use(verifyToken);

// Importar controladores (atención a exportaciones nombradas vs default)
const verTratamientos = require('../controllers/Tratamientos/verTratamientos.js');
const buscarTratamiento = require('../controllers/Tratamientos/buscarTratamiento.js');
const { agregarTratamiento } = require('../controllers/Tratamientos/agregarTratamiento.js');
const { editarTratamiento } = require('../controllers/Tratamientos/editarTratamiento.js');
const { eliminarTratamiento } = require('../controllers/Tratamientos/eliminarTratamiento.js');

// Rutas

// GET /api/:idClinica/tratamientos/buscar - Busqueda general (Debe ir ANTES de :idPaciente para no confundirse)
router.get('/tratamientos/buscar', buscarTratamiento);

// GET /api/:idClinica/tratamientos - Ver listado de tratamientos (Últimos 50)
router.get('/tratamientos', verTratamientos);

// POST /api/:idClinica/tratamientos - Agregar nuevo tratamiento
router.post('/tratamientos', agregarTratamiento);

// PUT /api/:idClinica/tratamientos/:id - Editar tratamiento existente
router.put('/tratamientos/:id', editarTratamiento);

// DELETE /api/:idClinica/tratamientos/:id - Desactivar (Cancelar) tratamiento
router.delete('/tratamientos/:id', eliminarTratamiento);

module.exports = router;
