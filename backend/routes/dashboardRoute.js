const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  
router.use(verifyToken);

// Importar funciones desde cada controlador

const  adminDashboard  = require('../controllers/Dashboard/adminDashboard.js');
//const  recepDashboard  = require('../controllers/Dashboard/recepDashboard.js');
//const  vetDashboard  = require('../controllers/Dashboard/vetDashboard.js');

router.get('/adminDashboard', adminDashboard);
//router.get('/recepDashboard', recepDashboard);
//router.get('/vetDashboard', vetDashboard);


module.exports = router;
