const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
router.use(verifyToken);
const permitirRoles = require('../middleware/roleMiddleware');


// Importar funciones desde cada controlador


const listadoInventario = require('../controllers/Inventario/listadoInventario.js');
const statsHoy = require('../controllers/Inventario/estadisticaInventario.js');
const agregarProducto = require('../controllers/Inventario/agregarProducto.js');
const actualizarProducto = require('../controllers/Inventario/actualizarProducto.js');
const eliminarProducto = require('../controllers/Inventario/eliminarProducto.js');
const reporteInventario = require('../controllers/Inventario/reporte.js');


router.get('/Inventarios', permitirRoles(2, 3), listadoInventario);
router.get('/Inventarios/estadisticas', permitirRoles(2, 3), statsHoy);
router.post('/Inventarios', permitirRoles(2, 3), agregarProducto);
router.get('/Inventarios/reporte', permitirRoles(2, 3), reporteInventario);
router.put('/Inventarios/:id', permitirRoles(2, 3), actualizarProducto);
router.delete('/Inventarios/:id', permitirRoles(2, 3), eliminarProducto);



module.exports = router;
