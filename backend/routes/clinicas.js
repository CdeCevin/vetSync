const express = require('express');
const router = express.Router();
const { verClinicas } = require('../controllers/verDB');

// Ruta para GET /api/clinicas
router.get('/clinicas', verClinicas);

module.exports = router;
