const { queryConReintento } = require('../../db/queryHelper');

const eliminarDueno = async (req, res) => {
  try {
    const idDueno = req.params.id;
    const idClinica = req.clinicaId;

    const qDesactivarPacientes = `
      UPDATE Pacientes
      SET activo = FALSE
      WHERE id_dueño = ? AND id_clinica = ? AND activo = TRUE
    `;

    const qDesactivarCitas = `
      UPDATE Citas
      SET activo = FALSE, estado = 'cancelada'
      WHERE id_paciente IN (
        SELECT id FROM Pacientes WHERE id_dueño = ? AND id_clinica = ?
      ) AND id_clinica = ? AND activo = TRUE
    `;

    const qDesactivarDueno = `
      UPDATE Dueños
      SET activo = FALSE
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    await queryConReintento(qDesactivarPacientes, [idDueno, idClinica]);

    await queryConReintento(qDesactivarCitas, [idDueno, idClinica, idClinica]);

    const results = await queryConReintento(qDesactivarDueno, [idDueno, idClinica]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Dueño no encontrado o no pertenece a esta clínica' });
    }

    res.json({ message: 'Dueño desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando dueño:', error);
    res.status(500).json({ error: 'Error al desactivar el dueño' });
  }
};

module.exports = eliminarDueno;
