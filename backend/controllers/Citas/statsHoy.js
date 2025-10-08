const connection = require('../../db/connection');

const estadisticasCitasDelDia = (req, res) => {
  const idClinica = req.clinicaId;

  const query = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
      SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) AS pendientes
    FROM Citas
    WHERE DATE(fecha_cita) = CURDATE()
      AND id_clinica = ?
      AND activo = TRUE
  `;

  connection.query(query, [idClinica], (error, results) => {
    if (error) {
      console.error('Error obteniendo estadísticas de citas:', error);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    res.json({
      total: results[0].total,
      completadas: results[0].completadas,
      pendientes: results[0].pendientes
    });
  });
};

module.exports = estadisticasCitasDelDia;
