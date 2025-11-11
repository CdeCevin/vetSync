const { queryConReintento } = require('../../db/queryHelper');

const listadoCita = async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const idUsuarioLogueado = req.usuario.id;
    const idRolUsuarioLogueado = req.usuario.id_rol;
    const idClinicaDelUsuario = req.usuario.id_clinica;

    let query = `
      SELECT c.*, p.nombre AS nombre_paciente, u.nombre_completo AS nombre_usuario
      FROM Citas c
      JOIN Pacientes p ON c.id_paciente = p.id AND p.activo = TRUE
      JOIN Usuarios u ON c.id_usuario = u.id AND u.activo = TRUE
      WHERE c.id_clinica = ? AND c.activo = TRUE
    `;

    const params = [idClinicaDelUsuario];

    if (idRolUsuarioLogueado !== 3) {
      query += ` AND c.id_usuario = ?`;
      params.push(idUsuarioLogueado);
    }

    const results = await queryConReintento(query, params);

    res.json(results);
  } catch (error) {
    console.error('Error obteniendo listado:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

module.exports = listadoCita;
