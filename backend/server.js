const express = require('express');
const usuariosRoutes = require('./routes/Usuarios/index');

const app = express();
const PORT = 3001;

app.use(express.json());

// Prefijo base con id de clínica dinámico
app.use('/api/:idClinica', (req, res, next) => {
  req.clinicaId = req.params.idClinica;  // Guardas el id de clínica para usarlo en los controladores
  next();
}, usuariosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
