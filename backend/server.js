const express = require('express');
const usuariosRoutes = require('./routes/Usuarios/index');
const authRoutes = require('./routes/auth/login');  // Ruta para login

const app = express();
const PORT = 3001;

app.use(express.json());

// Ruta de login sin prefijo de clínica
app.use('/api', authRoutes);

// Prefijo base con id de clínica dinámico para rutas protegidas
app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;  // Guardas el id de clínica para usarlo en los controladores
  next();
}, usuariosRoutes);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
