const { queryConReintento } = require('../../db/queryHelper');

const estadisticasCitasDelDia = async (req, res) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const idUsuarioLogueado = req.usuario.id;
    const idRolUsuarioLogueado = req.usuario.id_rol;
    const idClinicaDelUsuario = req.usuario.id_clinica;

    let query = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) AS pendientes
      FROM Citas
      WHERE DATE(fecha_cita) = CURDATE()
        AND id_clinica = ?
        AND activo = TRUE
    `;
    const params = [idClinicaDelUsuario];

    if (idRolUsuarioLogueado !== 3) {
      query += ` AND id_usuario = ?`;
      params.push(idUsuarioLogueado);
    }

    const results = await queryConReintento(query, params);

    res.json({
      total: results[0].total || 0,
      completadas: results[0].completadas || 0,
      pendientes: results[0].pendientes || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de citas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = estadisticasCitasDelDia;
