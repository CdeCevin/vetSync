const express = require('express');
const router = express.Router();
const agregarProcedimiento = require('../controllers/Procedimientos/agregarProcedimiento');
const editarProcedimiento = require('../controllers/Procedimientos/editarProcedimiento');
const eliminarProcedimiento = require('../controllers/Procedimientos/eliminarProcedimiento');
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/procedimientos', permitirRoles(1, 2), agregarProcedimiento);
router.put('/procedimientos/:id', permitirRoles(1, 2), editarProcedimiento);
router.delete('/procedimientos/:id', permitirRoles(1, 2), eliminarProcedimiento);

module.exports = router;
