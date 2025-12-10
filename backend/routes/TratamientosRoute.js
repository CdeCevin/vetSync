const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
router.use(verifyToken);

const verTratamientos = require('../controllers/Tratamientos/verTratamientos.js');
const buscarTratamiento = require('../controllers/Tratamientos/buscarTratamiento.js');
const { agregarTratamiento } = require('../controllers/Tratamientos/agregarTratamiento.js');
const { editarTratamiento } = require('../controllers/Tratamientos/editarTratamiento.js');
const { eliminarTratamiento } = require('../controllers/Tratamientos/eliminarTratamiento.js');


router.get('/tratamientos/buscar', buscarTratamiento);
router.get('/tratamientos', verTratamientos);
router.post('/tratamientos', agregarTratamiento);
router.put('/tratamientos/:id', editarTratamiento);
router.delete('/tratamientos/:id', eliminarTratamiento);

module.exports = router;
