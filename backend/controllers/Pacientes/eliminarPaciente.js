const connection = require('../../db/connection');

const eliminarPaciente = (req, res) => {
  const idPaciente = req.params.id;
  const idClinica = req.clinicaId;

  const query = `
    UPDATE Pacientes 
    SET activo = FALSE 
    WHERE id = ? AND id_clinica = ? AND activo = TRUE
  `;

  connection.query(query, [idPaciente, idClinica], (error, results) => {
    if (error) {
      console.error('Error desactivando paciente:', error);
      return res.status(500).json({ error: 'Error al desactivar paciente' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado o ya desactivado' });
    }

    res.json({ message: 'Paciente desactivado correctamente' });
  });
};

module.exports = eliminarPaciente;
