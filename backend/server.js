const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', 'backend/.env') });
const cors = require('cors');
const router = express.Router({ mergeParams: true });
const verifyToken = require('./middleware/authMiddleware');  //ACUERDATE KEVIN
const app = express();
app.use(cors()); // Aplica CORS antes de las rutas

console.log('JWT_SECRET en server.js:', process.env.JWT_SECRET);

router.use(verifyToken)
const usuariosRoutes = require('./routes/usuariosRoute');
const authRoutes = require('./routes/login');
const dueñosRoutes = require('./routes/dueñosRoute');
const pacientesRoutes = require('./routes/pacientesRoute');
const citasRoutes = require('./routes/citasRoute');
const tratamientosRoutes = require('./routes/TratamientosRoute.js');
const inventarioRoutes = require('./routes/inventarioRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const logsRoutes = require('./routes/logsRoute');
const procedimientosRoutes = require('./routes/procedimientosRoute');
const iaRoutes = require('./routes/iaRoute');
const historialRoutes = require('./routes/historialRoutes');


const PORT = 3001;

app.use(express.json());

// Ruta de login sin prefijo de clínica
app.use('/api', authRoutes);

// Prefijo base con id de clínica dinámico para rutas protegidas 

//APLICAR EL VERIFYTOKEN A TODAS LAS RUTAS QUE LO NECESITEN, para no mandar directamente el idClinica
app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, usuariosRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, dueñosRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, pacientesRoutes);


app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, citasRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, inventarioRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, iaRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, tratamientosRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, procedimientosRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, dashboardRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, logsRoutes);

app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;
  next();
}, historialRoutes);

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});


// Al final del archivo, antes de app.listen()  
module.exports = app;

// Modificar el listen para que solo se ejecute si no es un test  
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

