const { queryConReintento } = require('../../db/queryHelper');

const verPaciente = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const idPaciente = req.params.idPaciente;

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

    const queryHistorial = `
      SELECT 
        Historial_Medico.*,
        Usuarios.nombre_completo AS veterinario_nombre
      FROM Historial_Medico
      JOIN Usuarios ON Historial_Medico.id_usuario = Usuarios.id
      WHERE Historial_Medico.id_paciente = ? AND Historial_Medico.id_clinica = ?
      ORDER BY fecha_visita DESC
    `;



    const pacienteResults = await queryConReintento(queryPacienteDueno, [idPaciente, idClinica]);

    if (pacienteResults.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const paciente = pacienteResults[0];

    const historialResults = await queryConReintento(queryHistorial, [idPaciente, idClinica]);

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
  } catch (error) {
    console.error('Error buscando paciente:', error);
    res.status(500).json({ error: 'Error al buscar paciente' });
  }
};

module.exports = verPaciente;
