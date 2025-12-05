const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
const permitirRoles = require('../middleware/roleMiddleware');

router.use(verifyToken);
// router.use(permitirRoles(2, 3)); // <-- ERROR: Bloqueaba rutas posteriores (logs) para Admins

// Importar funciones desde cada controlador

//const  verInventario  = require('../controllers/Inventario/verInventarios.js');
//const  agendarInventario  = require('../controllers/Inventario/agendarInventario.js');
//const  editarInventario  = require('../controllers/Inventario/editarInventario.js');
//const  eliminarInventario  = require('../controllers/Inventario/eliminarInventario.js');
const listadoInventario = require('../controllers/Inventario/listadoInventarios.js');
//const resumenInventariosDelDia = require('../controllers/Inventario/statsHoy.js');

// Aplicar rol 2 y 3 especificamente a ésta ruta
router.get('/Inventarios', permitirRoles(2, 3), listadoInventario);

//router.get('/Inventarios/resume', resumenInventariosDelDia);
//router.get('/Inventarios/:identificador', verInventario);
//router.post('/Inventarios', agendarInventario);
//router.put('/Inventarios/:id', editarInventario);
//router.delete('/Inventarios/:id', eliminarInventario);

module.exports = router;
