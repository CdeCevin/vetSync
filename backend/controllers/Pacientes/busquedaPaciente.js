const { queryConReintento } = require('../../db/queryHelper');

const busquedaPacientes = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const filtro = req.query.q || '';

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

    query += ` ORDER BY Pacientes.nombre ASC`;
    const results = await queryConReintento(query, params);

    const pacientesConDueño = results.map(row => ({
      id: row.id,
      nombre: row.nombre,
      raza: row.raza,
      dueno: {
        nombre: row.dueno_nombre,
      }
    }));

    res.json(pacientesConDueño);
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

module.exports = busquedaPacientes;
