const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');
router.use(verifyToken);
// router.use(permitirRoles(2, 3)); // <-- ERROR: Bloqueaba rutas posteriores para Admins

// Importar funciones desde cada controlador

const verCita = require('../controllers/Citas/verCitas.js');
const agendarCita = require('../controllers/Citas/agendarCita.js');
const editarCita = require('../controllers/Citas/editarCita.js');
const eliminarCita = require('../controllers/Citas/eliminarCita.js');
const listadoCita = require('../controllers/Citas/listadoCita.js');
const estadisticasCitasDelDia = require('../controllers/Citas/statsHoy.js');
const estadoCita = require('../controllers/Citas/estadoCita.js');

// Aplicamos el rol 2 y 3 especificamente a estas rutas
router.get('/Citas', permitirRoles(2, 3), listadoCita);
router.get('/Citas/statsHoy', permitirRoles(2, 3), estadisticasCitasDelDia);
router.get('/Citas/:identificador', permitirRoles(2, 3), verCita);
router.post('/Citas', permitirRoles(2, 3), agendarCita);
router.put('/Citas/:id', permitirRoles(2, 3), editarCita);
router.patch('/Citas/:id', permitirRoles(2, 3), estadoCita);
router.delete('/Citas/:id', permitirRoles(2, 3), eliminarCita);

module.exports = router;
