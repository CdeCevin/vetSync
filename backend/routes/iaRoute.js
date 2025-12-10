const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/authMiddleware.js');
router.use(verifyToken);
const permitirRoles = require('../middleware/roleMiddleware');
const { getInventoryPrediction } = require('../controllers/IA/manejoInventario.js');
const { searchMedicalHistorySmart } = require('../controllers/IA/busquedaInteligente.js');



router.get('/IA/prediccion', permitirRoles(2, 3), getInventoryPrediction);
router.post('/IA/historial', permitirRoles(2), searchMedicalHistorySmart);

module.exports = router;    