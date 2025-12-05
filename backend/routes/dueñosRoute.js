const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
const permitirRoles = require('../middleware/roleMiddleware');
router.use(verifyToken);


// Importar funciones desde cada controlador

const verDuenos = require('../controllers/Dueños/verDueño.js');
const crearDueno = require('../controllers/Dueños/crearDueño.js');
const editarDueno = require('../controllers/Dueños/editarDueño.js');
const eliminarDueno = require('../controllers/Dueños/eliminarDueño.js');
const listadoDueño = require('../controllers/Dueños/listadoDueño.js');

router.get('/duenos', permitirRoles(2, 3), listadoDueño);
router.post('/duenos', permitirRoles(3), crearDueno);
router.get('/duenos/:identificador', permitirRoles(2, 3), verDuenos);
router.put('/duenos/:id', permitirRoles(3), editarDueno);
router.delete('/duenos/:id', eliminarDueno); // No estaba claro en la tabla quien elimina, asumo Recep (3) por coherencia; si es Admin seria 1. User dijo: "Solo el Recepcionista puede desactivar pacientes o dueños" -> 3.
router.delete('/duenos/:id', permitirRoles(3), eliminarDueno);

module.exports = router;
