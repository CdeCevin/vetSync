const { queryConReintento } = require('../../db/queryHelper');

const estadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const idClinica = req.clinicaId;

    if (!estado) {
      return res.status(400).json({ error: 'El campo "estado" es requerido en el body.' });
    }

    const selectQuery = 'SELECT id FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(selectQuery, [id, idClinica]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
    }

    const updateQuery = 'UPDATE Citas SET estado = ? WHERE id = ? AND id_clinica = ?';
    await queryConReintento(updateQuery, [estado, id, idClinica]);

    res.json({ message: 'Estado de la cita actualizado correctamente' });
  } catch (err) {
    console.error('Error actualizando estado de la Cita:', err);
    res.status(500).json({ error: 'Error interno del servidor al actualizar la cita' });
  }
};

module.exports = estadoCita;
