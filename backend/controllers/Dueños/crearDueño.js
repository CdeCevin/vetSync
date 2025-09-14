const connection = require('../../db/connection');

const crearDueno = (req, res) => {
  const idClinica = req.clinicaId; // viene del middleware o prefijo de ruta
  const { nombre, telefono, correo, direccion } = req.body;

  // Validación básica
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const query = `
    INSERT INTO Dueños (nombre, telefono, correo, direccion, id_clinica)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [nombre, telefono, correo, direccion, idClinica],
    (error, results) => {
      if (error) {
        console.error('Error creando dueño:', error);
        return res.status(500).json({ error: 'Error al crear dueño' });
      }
      res.status(201).json({ message: 'Dueño creado', id: results.insertId });
    }
  );
};

module.exports = crearDueno;
