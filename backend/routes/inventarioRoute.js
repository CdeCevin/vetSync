const express = require('express');
const router = express.Router({ mergeParams: true });

// Importar funciones desde cada controlador

//const  verInventario  = require('../controllers/Inventario/verInventarios.js');
//const  agendarInventario  = require('../controllers/Inventario/agendarInventario.js');
//const  editarInventario  = require('../controllers/Inventario/editarInventario.js');
//const  eliminarInventario  = require('../controllers/Inventario/eliminarInventario.js');
const listadoInventario  = require('../controllers/Inventario/listadoInventarios.js');
//const resumenInventariosDelDia = require('../controllers/Inventario/statsHoy.js');

router.get('/Inventarios', listadoInventario);
//router.get('/Inventarios/resume', resumenInventariosDelDia);
//router.get('/Inventarios/:identificador', verInventario);
//router.post('/Inventarios', agendarInventario);
//router.put('/Inventarios/:id', editarInventario);
//router.delete('/Inventarios/:id', eliminarInventario);


module.exports = router;
