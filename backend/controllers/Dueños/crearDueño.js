const connection = require('../../db/connection');

const crearDueno = (req, res) => {
  const idClinica = req.clinicaId;
  const { nombre, telefono, correo, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!correo) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  // Validar que correo no exista para esta clínica
  const validarCorreoQuery = 'SELECT COUNT(*) AS count FROM Dueños WHERE correo = ? AND id_clinica = ? AND activo = TRUE';
  connection.query(validarCorreoQuery, [correo, idClinica], (err, results) => {
    if (err) {
      console.error('Error validando correo:', err);
      return res.status(500).json({ error: 'Error al validar correo' });
    }
    if (results[0].count > 0) {
      return res.status(409).json({ error: 'Ya existe un dueño con ese correo en la clínica' });
    }

    // Insertar si no hay conflicto
    const query = `
      INSERT INTO Dueños (nombre, telefono, correo, direccion, id_clinica)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [nombre, telefono, correo, direccion, idClinica], (error, results) => {
      if (error) {
        console.error('Error creando dueño:', error);
        return res.status(500).json({ error: 'Error al crear dueño' });
      }
      res.status(201).json({ message: 'Dueño creado', id: results.insertId });
    });
  });
};

module.exports = crearDueno;
