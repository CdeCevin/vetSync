const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');
const getDiff = require('../../utils/diffHelper');

const editarCita = async (req, res) => {
  try {
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

    const results = await queryConReintento(
      'SELECT * FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE',
      [idCita, idClinica]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
    }

    const citaActual = results[0];

    // Validación de Rol: Veterinario (2) solo puede editar sus propias citas
    if (req.usuario.id_rol === 2 && citaActual.id_usuario !== req.usuario.id) {
      return res.status(403).json({ error: 'Acceso denegado. No puedes editar citas de otros veterinarios.' });
    }

    const nuevoPaciente = id_paciente !== undefined ? id_paciente : citaActual.id_paciente;
    // Si es Vet, no permitimos cambiar el id_usuario (reasignar cita), o si lo intenta debe ser a si mismo
    let nuevoUsuario = id_usuario !== undefined ? id_usuario : citaActual.id_usuario;
    if (req.usuario.id_rol === 2 && nuevoUsuario !== req.usuario.id) {
      return res.status(403).json({ error: 'No puedes reasignar la cita a otro veterinario.' });
    }
    const nuevaFecha = fecha_cita !== undefined ? fecha_cita : citaActual.fecha_cita;
    const nuevaDuracion = duracion_minutos !== undefined ? duracion_minutos : citaActual.duracion_minutos;
    const nuevoMotivo = motivo !== undefined ? motivo : citaActual.motivo;
    const nuevoTipo = tipo_cita !== undefined ? tipo_cita : citaActual.tipo_cita;
    const nuevasNotas = notas !== undefined ? notas : citaActual.notas;

    const validarQuery = `
      SELECT 
        (SELECT COUNT(*) FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS paciente_valido,
        (SELECT COUNT(*) FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS usuario_valido
    `;

    const valRes = await queryConReintento(validarQuery, [nuevoPaciente, idClinica, nuevoUsuario, idClinica]);

    const { paciente_valido, usuario_valido } = valRes[0];

    if (!paciente_valido) {
      return res.status(400).json({ error: 'Paciente no válido o no pertenece a esta clínica' });
    }
    if (!usuario_valido) {
      return res.status(400).json({ error: 'Usuario no válido o no pertenece a esta clínica' });
    }

    const updateQuery = `
      UPDATE Citas 
      SET id_paciente = ?, id_usuario = ?, fecha_cita = ?, duracion_minutos = ?, motivo = ?, tipo_cita = ?, notas = ?
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    await queryConReintento(
      updateQuery,
      [nuevoPaciente, nuevoUsuario, nuevaFecha, nuevaDuracion, nuevoMotivo, nuevoTipo, nuevasNotas, idCita, idClinica]
    );

    // Audit Log con Diff
    const updates = {
      id_paciente: nuevoPaciente,
      id_usuario: nuevoUsuario,
      fecha_cita: nuevaFecha,
      duracion_minutos: nuevaDuracion,
      motivo: nuevoMotivo,
      tipo_cita: nuevoTipo,
      notas: nuevasNotas
    };
    const cambios = getDiff(citaActual, updates);

    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'MODIFICAR',
      entidad: 'Cita',
      id_entidad: idCita,
      detalles: cambios ? JSON.stringify(cambios) : 'Actualización de Cita (sin cambios detectados)'
    });

    res.json({ message: 'Cita actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando Cita:', error);
    res.status(500).json({ error: 'Error al actualizar Cita' });
  }
};

module.exports = editarCita;
