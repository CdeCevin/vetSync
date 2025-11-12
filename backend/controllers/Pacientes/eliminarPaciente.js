const { queryConReintento } = require('../../db/queryHelper');

const eliminarPaciente = async (req, res) => {
  try {
    const idPaciente = req.params.id;
    const idClinica = req.clinicaId;

    const query = `
      UPDATE Pacientes 
      SET activo = FALSE 
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    const results = await queryConReintento(query, [idPaciente, idClinica]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado o ya desactivado' });
    }

    res.json({ message: 'Paciente desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando paciente:', error);
    res.status(500).json({ error: 'Error al desactivar paciente' });
  }
};

module.exports = eliminarPaciente;
