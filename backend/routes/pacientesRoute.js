const express = require('express');
const router = express.Router({ mergeParams: true });

// Importar funciones desde cada controlador

const  verPaciente  = require('../controllers/Pacientes/verPaciente.js');
const  crearPaciente  = require('../controllers/Pacientes/crearPaciente.js');
const  editarPaciente  = require('../controllers/Pacientes/editarPaciente.js');
const  eliminarPaciente  = require('../controllers/Pacientes/eliminarPaciente.js');
const busquedaPacientes  = require('../controllers/Pacientes/busquedaPaciente.js');


router.post('/Pacientes', crearPaciente);
router.get('/Pacientes/buscar', busquedaPacientes);    // ruta específica arriba
router.get('/Pacientes/:idPaciente', verPaciente);     // ruta dinámica abajo
router.put('/Pacientes/:id', editarPaciente);
router.delete('/Pacientes/:id', eliminarPaciente);

module.exports = router;
