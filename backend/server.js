const express = require('express');
const clinicasRoutes = require('./rutas/clinicas');

const app = express();
const PORT = 3001;

app.use(express.json());

// Prefijo base para todas las rutas API
app.use('/api', clinicasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
