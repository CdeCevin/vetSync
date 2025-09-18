const connection = require('../../db/connection');

const editarCita = (req, res) => {
  const idCita = req.params.id;
  const idClinica = req.clinicaId;
  const {
    id_paciente,
    id_usuario,
    fecha_cita,
    duracion_minutos,
    motivo,
    tipo_cita,
    notas
  } = req.body;

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

      const citaActual = results[0];
      const nuevoPaciente = id_paciente !== undefined ? id_paciente : citaActual.id_paciente;
      const nuevoUsuario = id_usuario !== undefined ? id_usuario : citaActual.id_usuario;
      const nuevaFecha = fecha_cita !== undefined ? fecha_cita : citaActual.fecha_cita;
      const nuevaDuracion = duracion_minutos !== undefined ? duracion_minutos : citaActual.duracion_minutos;
      const nuevoMotivo = motivo !== undefined ? motivo : citaActual.motivo;
      const nuevoTipo = tipo_cita !== undefined ? tipo_cita : citaActual.tipo_cita;
      const nuevasNotas = notas !== undefined ? notas : citaActual.notas;

      // Verificar que paciente y usuario sean de la clínica y estén activos
      const validarQuery = `
        SELECT 
          (SELECT COUNT(*) FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS paciente_valido,
          (SELECT COUNT(*) FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS usuario_valido
      `;

      connection.query(validarQuery, [nuevoPaciente, idClinica, nuevoUsuario, idClinica], (valErr, valRes) => {
        if (valErr) {
          console.error('Error validando paciente/usuario:', valErr);
          return res.status(500).json({ error: 'Error en validación de datos' });
        }
        const { paciente_valido, usuario_valido } = valRes[0];

        if (!paciente_valido) {
          return res.status(400).json({ error: 'Paciente no válido o no pertenece a esta clínica' });
        }
        if (!usuario_valido) {
          return res.status(400).json({ error: 'Usuario no válido o no pertenece a esta clínica' });
        }

        // Actualizar cita con los valores validados
        const updateQuery = `
          UPDATE Citas 
          SET id_paciente = ?, id_usuario = ?, fecha_cita = ?, duracion_minutos = ?, motivo = ?, tipo_cita = ?, notas = ?
          WHERE id = ? AND id_clinica = ? AND activo = TRUE
        `;

        connection.query(
          updateQuery,
          [nuevoPaciente, nuevoUsuario, nuevaFecha, nuevaDuracion, nuevoMotivo, nuevoTipo, nuevasNotas, idCita, idClinica],
          (updateErr) => {
            if (updateErr) {
              console.error('Error actualizando Cita:', updateErr);
              return res.status(500).json({ error: 'Error al actualizar Cita' });
            }
            res.json({ message: 'Cita actualizada correctamente' });
          }
        );
      });
    }
  );
};

module.exports = editarCita;
