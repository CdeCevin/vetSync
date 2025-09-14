const express = require('express');
const router = express.Router({ mergeParams: true });
const verUsuarios = require('../../controllers/Usuarios/listadoUsuarios');
const crearUsuario = require('../../controllers/Usuarios/agregarUsuario');

router.get('/usuarios', verUsuarios);
router.post('/crearUsuario', crearUsuario);

module.exports = router;
