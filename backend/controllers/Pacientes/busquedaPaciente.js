const connection = require('../../db/connection');

const busquedaPacientes = (req, res) => {
  const idClinica = req.clinicaId;
  const filtro = req.query.q || '';  // parámetro de búsqueda opcional

  let query = `
    SELECT 
      Pacientes.*,
      Dueños.nombre AS dueno_nombre,
      Dueños.telefono AS dueno_telefono,
      Dueños.correo AS dueno_correo,
      Dueños.direccion AS dueno_direccion
    FROM Pacientes
    INNER JOIN Dueños ON Pacientes.id_dueño = Dueños.id
    WHERE Pacientes.id_clinica = ? 
      AND Pacientes.activo = TRUE 
      AND Dueños.activo = TRUE
  `;

  const params = [idClinica];

  if (filtro.trim() !== '') {
    query += ` AND (
      Pacientes.nombre LIKE ? OR
      Dueños.nombre LIKE ? OR
      Pacientes.raza LIKE ?
    )`;
    const filtroLike = `%${filtro}%`;
    params.push(filtroLike, filtroLike, filtroLike);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error obteniendo pacientes:', error);
      return res.status(500).json({ error: 'Error al obtener pacientes' });
    }

    // Transformar resultados para anidar dueño dentro de paciente
    const pacientesConDueño = results.map(row => ({
      id: row.id,
      nombre: row.nombre,
      raza: row.raza,
      dueno: {
        nombre: row.dueno_nombre,
      }
    }));

    res.json(pacientesConDueño);
  });
};

module.exports = busquedaPacientes;
