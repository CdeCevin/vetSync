const express = require('express');
const router = express.Router({ mergeParams: true });

// Importar funciones desde cada controlador

//const  verDueños  = require('../controllers/Dueños/verDueño.js');
const  crearDueno  = require('../controllers/Dueños/crearDueño.js');
//const  editarDueño  = require('../controllers/Dueños/editarDueño.js');
//const  eliminarDueño  = require('../controllers/Dueños/eliminarDueño.js');
///const listadoDueño  = require('../controllers/Dueños/listadoDueño.js');

//router.get('/dueños', listadoDueño);
router.post('/duenos', crearDueno);
//router.get('/dueños/:identificador', verDueños);
//router.put('/dueños/:id', editarDueño);
//router.delete('/dueños/:id', eliminarDueño);

module.exports = router;
