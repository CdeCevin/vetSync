const connection = require('../../db/connection');

const verCita = (req, res) => {
  const idClinica = req.params.idClinica;
  const identificador = req.params.identificador;

  let query = `
    SELECT c.*, p.nombre AS nombre_paciente, u.nombre_completo AS nombre_usuario
    FROM Citas c
    JOIN Pacientes p ON c.id_paciente = p.id AND p.activo = TRUE
    JOIN Usuarios u ON c.id_usuario = u.id AND u.activo = TRUE
    WHERE c.id_clinica = ? AND c.activo = TRUE
  `;

  const params = [idClinica];

  if (/^\d+$/.test(identificador)) {
    // Si es número puede ser id_paciente o id_usuario o id cita
    query += ` AND (c.id_paciente = ? OR c.id_usuario = ? OR c.id = ?)`;
    params.push(identificador, identificador, identificador);
  } else {
    // Si es string buscar por nombre paciente o usuario (LIKE insensible)
    query += ` AND (p.nombre LIKE ? OR u.nombre_completo LIKE ?)`;
    params.push(`%${identificador}%`, `%${identificador}%`);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error buscando cita:', error);
      return res.status(500).json({ error: 'Error al obtener cita' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json(results);
  });
};

module.exports = verCita;
