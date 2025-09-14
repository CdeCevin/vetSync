const connection = require('../../db/connection');

const eliminarDueno = (req, res) => {
  const idDueno = req.params.id;
  const idClinica = req.clinicaId;

  // 1. Desactivar pacientes del dueño
  const qDesactivarPacientes = `
    UPDATE Pacientes
    SET activo = FALSE
    WHERE id_dueño = ? AND id_clinica = ? AND activo = TRUE
  `;

  // 2. Desactivar citas de los pacientes del dueño
  const qDesactivarCitas = `
    UPDATE Citas
    SET activo = FALSE, estado = 'cancelada'
    WHERE id_paciente IN (
      SELECT id FROM Pacientes WHERE id_dueño = ? AND id_clinica = ?
    ) AND id_clinica = ? AND activo = TRUE
  `;

  // 3. Desactivar dueño
  const qDesactivarDueno = `
    UPDATE Dueños
    SET activo = FALSE
    WHERE id = ? AND id_clinica = ? AND activo = TRUE
  `;

  connection.query(qDesactivarPacientes, [idDueno, idClinica], (errPacientes) => {
    if (errPacientes) {
      console.error('Error desactivando pacientes:', errPacientes);
      return res.status(500).json({ error: 'Error al desactivar los pacientes del dueño' });
    }

    connection.query(qDesactivarCitas, [idDueno, idClinica, idClinica], (errCitas) => {
      if (errCitas) {
        console.error('Error desactivando citas:', errCitas);
        return res.status(500).json({ error: 'Error al desactivar las citas del dueño' });
      }

      connection.query(qDesactivarDueno, [idDueno, idClinica], (errDueno, results) => {
        if (errDueno) {
          console.error('Error desactivando dueño:', errDueno);
          return res.status(500).json({ error: 'Error al desactivar el dueño' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Dueño no encontrado o no pertenece a esta clínica' });
        }

        res.json({ message: 'Dueño desactivado correctamente' });
      });
    });
  });
};

module.exports = eliminarDueno;
