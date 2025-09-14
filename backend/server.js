const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors()); // Aplica CORS antes de las rutas

console.log('JWT_SECRET en server.js:', process.env.JWT_SECRET);

const usuariosRoutes = require('./routes/usuariosRoute');
const authRoutes = require('./routes/login');
const dueñosRoutes = require('./routes/dueñosRoute');

const PORT = 3001;

app.use(express.json());

// Ruta de login sin prefijo de clínica
app.use('/api', authRoutes);

// Prefijo base con id de clínica dinámico para rutas protegidas
app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, usuariosRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, dueñosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
