const express = require('express');
const router = express.Router();
const login = require('../controllers/Auth/login');
const registroClinica = require('../controllers/Auth/registroClinica');


router.post('/login', login);
router.post('/registroClinica', registroClinica);
module.exports = router;
