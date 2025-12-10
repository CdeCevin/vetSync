const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');
router.use(verifyToken);


// Importar funciones desde cada controlador

const verPaciente = require('../controllers/Pacientes/verPaciente.js');
const crearPaciente = require('../controllers/Pacientes/crearPaciente.js');
const editarPaciente = require('../controllers/Pacientes/editarPaciente.js');
const eliminarPaciente = require('../controllers/Pacientes/eliminarPaciente.js');
const busquedaPacientes = require('../controllers/Pacientes/busquedaPaciente.js');


router.post('/Pacientes', permitirRoles(3), crearPaciente);
router.get('/Pacientes', permitirRoles(2, 3), busquedaPacientes);
router.get('/Pacientes/buscar', permitirRoles(2, 3), busquedaPacientes);
router.get('/Pacientes/:idPaciente', permitirRoles(2, 3), verPaciente);
router.put('/Pacientes/:id', permitirRoles(3), editarPaciente);
router.delete('/Pacientes/:id', permitirRoles(3), eliminarPaciente);

module.exports = router;
