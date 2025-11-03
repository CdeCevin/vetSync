const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
router.use(verifyToken);


// Importar funciones desde cada controlador

const  verTratamientos  = require('../controllers/Tratamientos/verTratamientos.js');
//const  crearTratamientos  = require('../controllers/Tratamientos/crearTratamientos.js');
//const  editarTratamientos  = require('../controllers/Tratamientos/editarTratamientos.js');
//const  eliminarTratamientos  = require('../controllers/Tratamientos/eliminarTratamientos.js');
//const busquedaTratamientos  = require('../controllers/Tratamientos/busquedaTratamientos.js');


//router.post('/Tratamientos', crearTratamientos);
//router.get('/Tratamientos/buscar', busquedaTratamientos);    
router.get('/Tratamientos/:idPaciente', verTratamientos);    
//router.put('/Tratamientos/:id', editarTratamientos);
//router.delete('/Tratamientos/:id', eliminarTratamientos);

module.exports = router;
