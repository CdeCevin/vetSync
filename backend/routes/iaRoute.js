const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');  //ACUERDATE KEVIN
router.use(verifyToken);
const permitirRoles = require('../middleware/roleMiddleware');
const { getInventoryPrediction } = require('../controllers/IA/manejoInventario.js');



router.get('/IA/prediccion', permitirRoles(2, 3), getInventoryPrediction);

module.exports = router;