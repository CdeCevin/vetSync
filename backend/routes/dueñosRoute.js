const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
router.use(verifyToken);


// Importar funciones desde cada controlador

const  verDuenos  = require('../controllers/Dueños/verDueño.js');
const  crearDueno  = require('../controllers/Dueños/crearDueño.js');
const  editarDueno  = require('../controllers/Dueños/editarDueño.js');
const  eliminarDueno  = require('../controllers/Dueños/eliminarDueño.js');
const listadoDueño  = require('../controllers/Dueños/listadoDueño.js');

router.get('/duenos', listadoDueño);
router.post('/duenos', crearDueno);
router.get('/duenos/:identificador', verDuenos);
router.put('/duenos/:id', editarDueno);
router.delete('/duenos/:id', eliminarDueno);

module.exports = router;
