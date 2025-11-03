const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
router.use(verifyToken);


// Importar funciones desde cada controlador
const  verUsuarios  = require('../controllers/Usuarios/listadoUsuarios.js');
const  crearUsuario  = require('../controllers/Usuarios/agregarUsuario.js');
const  editarUsuario  = require('../controllers/Usuarios/editarUsuario.js');
const  eliminarUsuario  = require('../controllers/Usuarios/eliminarUsuario.js');
const verUsuario  = require('../controllers/Usuarios/verUsuario.js');

router.get('/usuarios', verUsuarios);
router.post('/usuarios', crearUsuario);
router.get('/usuarios/:identificador', verUsuario);
router.put('/usuarios/:id', editarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

module.exports = router;
