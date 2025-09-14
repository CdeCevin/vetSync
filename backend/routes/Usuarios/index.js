const express = require('express');
const router = express.Router({ mergeParams: true });

// Importar funciones desde cada controlador
const  verUsuarios  = require('../../controllers/Usuarios/listadoUsuarios.js');
const  crearUsuario  = require('../../controllers/Usuarios/agregarUsuario');
const  editarUsuario  = require('../../controllers/Usuarios/editarUsuario');
const  eliminarUsuario  = require('../../controllers/Usuarios/eliminarUsuario');
const verUsuario  = require('../../controllers/Usuarios/verUsuario');

router.get('/usuarios', verUsuarios);
router.post('/usuarios', crearUsuario);
router.get('/usuarios/:id', verUsuario);
router.put('/usuarios/:id', editarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

module.exports = router;
