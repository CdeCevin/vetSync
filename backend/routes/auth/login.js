const express = require('express');
const router = express.Router();
const login = require('../../controllers/Auth/login');

router.post('/login', login);

module.exports = router;
