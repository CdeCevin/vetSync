const connection = require('../../db/connection');

const eliminarCita = (req, res) => {
  const idCita = req.params.id;
  const idClinica = req.clinicaId;

  // Paso 1: Comprobar que la cita existe, está activa y pertenece a la clínica
  connection.query(
    'SELECT * FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE',
    [idCita, idClinica],
    (err, results) => {
      if (err) {
        console.error('Error buscando Cita:', err);
        return res.status(500).json({ error: 'Error al buscar Cita' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
      }

      // Paso 2: Desactivar cita
      const query = `
        UPDATE Citas
        SET activo = FALSE, estado = 'cancelada'
        WHERE id = ? AND id_clinica = ? AND activo = TRUE
      `;

      connection.query(query, [idCita, idClinica], (error, resultsUpdate) => {
        if (error) {
          console.error('Error desactivando cita:', error);
          return res.status(500).json({ error: 'Error al desactivar cita' });
        }

        if (resultsUpdate.affectedRows === 0) {
          return res.status(404).json({ message: 'Cita ya estaba desactivada' });
        }

        res.json({ message: 'Cita desactivada correctamente' });
      });
    }
  );
};

module.exports = eliminarCita;
