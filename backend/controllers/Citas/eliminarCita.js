const { queryConReintento } = require('../../db/queryHelper');
const eliminarCita = async (req, res) => {
  try {
    const idCita = req.params.id;
    const idClinica = req.clinicaId;

    const results = await queryConReintento(
      'SELECT * FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE',
      [idCita, idClinica]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
    }

    const query = `
      UPDATE Citas
      SET activo = FALSE, estado = 'cancelada'
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    const resultsUpdate = await queryConReintento(query, [idCita, idClinica]);

    if (resultsUpdate.affectedRows === 0) {
      return res.status(404).json({ message: 'Cita ya estaba desactivada' });
    }

    res.json({ message: 'Cita desactivada correctamente' });
  } catch (error) {
    console.error('Error desactivando cita:', error);
    res.status(500).json({ error: 'Error al desactivar cita' });
  }
};

module.exports = eliminarCita;
