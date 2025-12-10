const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
const permitirRoles = require('../middleware/roleMiddleware');
router.use(verifyToken);

const verUsuarios = require('../controllers/Usuarios/listadoUsuarios.js');
const crearUsuario = require('../controllers/Usuarios/agregarUsuario.js');
const editarUsuario = require('../controllers/Usuarios/editarUsuario.js');
const eliminarUsuario = require('../controllers/Usuarios/eliminarUsuario.js');
const verUsuario = require('../controllers/Usuarios/verUsuario.js');
const listadoVeterinarios = require('../controllers/Usuarios/listadoVeterinarios.js');


router.get('/usuarios/veterinarios', permitirRoles(1, 2, 3), listadoVeterinarios);
router.get('/usuarios', permitirRoles(1), verUsuarios);
router.post('/usuarios', permitirRoles(1), crearUsuario);
router.get('/usuarios/:identificador', permitirRoles(1), verUsuario);
router.put('/usuarios/:id', permitirRoles(1), editarUsuario);
router.delete('/usuarios/:id', permitirRoles(1), eliminarUsuario);

module.exports = router;


