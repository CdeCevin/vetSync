const { queryConReintento } = require('../../db/queryHelper');

const verCita = async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const idUsuarioLogueado = req.usuario.id;
    const idRolUsuarioLogueado = req.usuario.id_rol;
    const idClinicaDelUsuario = req.usuario.id_clinica;
    const identificador = req.params.identificador;

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

    if (/^\d+$/.test(identificador)) {
      query += ` AND (c.id_paciente = ? OR c.id_usuario = ? OR c.id = ?)`;
      params.push(identificador, identificador, identificador);
    } else {
      query += ` AND (p.nombre LIKE ? OR u.nombre_completo LIKE ?)`;
      params.push(`%${identificador}%`, `%${identificador}%`);
    }

    const results = await queryConReintento(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o sin permisos para verla' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error buscando cita:', error);
    res.status(500).json({ error: 'Error al obtener cita' });
  }
};

module.exports = verCita;
