const connection = require('../../db/connection');

const verPaciente = (req, res) => {
  const idClinica = req.clinicaId;
  const idPaciente = req.params.idPaciente;

  console.log('Ver paciente - idClinica:', idClinica, 'idPaciente:', idPaciente);

  // Consulta paciente + dueño
  const queryPacienteDueno = `
    SELECT
      Pacientes.*,
      Dueños.nombre AS dueno_nombre,
      Dueños.telefono AS dueno_telefono,
      Dueños.correo AS dueno_correo,
      Dueños.direccion AS dueno_direccion
    FROM Pacientes
    INNER JOIN Dueños ON Pacientes.id_dueño = Dueños.id
    WHERE Pacientes.id = ? AND Pacientes.id_clinica = ? AND Pacientes.activo = TRUE
      AND Dueños.activo = TRUE
    LIMIT 1
  `;

  // Consulta historial médico del paciente
  const queryHistorial = `
    SELECT * FROM Historial_Medico
    WHERE id_paciente = ? AND id_clinica = ? 
    ORDER BY fecha_visita DESC
  `;

  connection.query(queryPacienteDueno, [idPaciente, idClinica], (err, pacienteResults) => {
    if (err) {
      console.error('Error buscando paciente:', err);
      return res.status(500).json({ error: 'Error al buscar paciente' });
    }
    if (pacienteResults.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const paciente = pacienteResults[0];
    connection.query(queryHistorial, [idPaciente, idClinica], (errHist, historialResults) => {
      if (errHist) {
        console.error('Error buscando historial médico:', errHist);
        return res.status(500).json({ error: 'Error al buscar historial médico' });
      }

      // JSON estructurado
      const respuesta = {
        mascota: {
          id: paciente.id,
          nombre: paciente.nombre,
          especie: paciente.especie,
          raza: paciente.raza,
          color: paciente.color,
          edad: paciente.edad,
          peso: paciente.peso,
          numero_microchip: paciente.numero_microchip,
          activo: paciente.activo,
          id_dueño: paciente.id_dueño,
          id_clinica: paciente.id_clinica,
          creado_en: paciente.creado_en,
          actualizado_en: paciente.actualizado_en,
        },
        dueño: {
          nombre: paciente.dueno_nombre,
          telefono: paciente.dueno_telefono,
          correo: paciente.dueno_correo,
          direccion: paciente.dueno_direccion,
        },
        historial: historialResults
      };

      res.json(respuesta);
    });
  });
};

module.exports = verPaciente;
