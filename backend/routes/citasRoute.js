const express = require('express');
const router = express.Router({ mergeParams: true });

// Importar funciones desde cada controlador

const  verCita  = require('../controllers/Citas/verCitas.js');
const  agendarCita  = require('../controllers/Citas/agendarCita.js');
const  editarCita  = require('../controllers/Citas/editarCita.js');
const  eliminarCita  = require('../controllers/Citas/eliminarCita.js');
const listadoCita  = require('../controllers/Citas/listadoCita.js');
const estadisticasCitasDelDia = require('../controllers/Citas/statsHoy.js');

router.get('/Citas', listadoCita);
router.get('/Citas/statsHoy', estadisticasCitasDelDia);
router.get('/Citas/:identificador', verCita);
router.post('/Citas', agendarCita);
router.put('/Citas/:id', editarCita);
router.delete('/Citas/:id', eliminarCita);


module.exports = router;
