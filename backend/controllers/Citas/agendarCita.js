const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const crearCita = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const {
      id_paciente,
      id_usuario: idUsuarioBody, // Renombramos para no conflictuar con let
      fecha_cita,
      duracion_minutos,
      motivo,
      tipo_cita,
      notas
    } = req.body;

    const idRol = req.usuario.id_rol;

    // Si es Veterinario (2), solo puede agendarse a sí mismo
    let id_usuario = idUsuarioBody;
    if (idRol === 2) {
      if (idUsuarioBody && idUsuarioBody !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para agendar citas a otros veterinarios.' });
      }
      id_usuario = req.usuario.id;
    }

    // --- MODIFICACIÓN 1: duracion_minutos ahora es obligatorio ---
    if (!id_paciente || !id_usuario || !fecha_cita || !duracion_minutos || !motivo || !tipo_cita || !idClinica) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (id_paciente, id_usuario, fecha_cita, duracion_minutos, motivo, tipo_cita, idClinica)' });
    }

    // Validaciones de formato y tipo
    if (isNaN(Date.parse(fecha_cita))) {
      return res.status(400).json({ error: 'Formato de fecha_cita inválido' });
    }

    // --- MODIFICACIÓN 2: Validación de duracion_minutos (simplificada) ---
    if (typeof duracion_minutos !== 'number' || duracion_minutos <= 0) {
      return res.status(400).json({ error: 'duracion_minutos debe ser un número positivo' });
    }

    // 1. Verificar existencia de Paciente y Usuario (como ya lo tenías)
    const sqlCheck = `SELECT 
        (SELECT id FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS paciente, 
        (SELECT id FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS usuario`;

    const checkRes = await queryConReintento(sqlCheck, [id_paciente, idClinica, id_usuario, idClinica]);

    const pacienteExiste = checkRes[0].paciente !== null;
    const usuarioExiste = checkRes[0].usuario !== null;

    if (!pacienteExiste) {
      return res.status(404).json({ error: 'Paciente no encontrado o inactivo en clínica' });
    }
    if (!usuarioExiste) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo en clínica' });
    }


    // (NuevaCita_Inicio < CitaExistente_Fin) Y (NuevaCita_Fin > CitaExistente_Inicio)
    const sqlCheckConflicto = `
      SELECT 1 
      FROM Citas
      WHERE id_usuario = ? 
        AND id_clinica = ?
        AND activo = TRUE
        AND (
          ? < DATE_ADD(fecha_cita, INTERVAL duracion_minutos MINUTE)
          AND
          DATE_ADD(?, INTERVAL ? MINUTE) > fecha_cita
        )
      LIMIT 1`;

    const conflictoRes = await queryConReintento(
      sqlCheckConflicto,
      [
        id_usuario,
        idClinica,
        fecha_cita,
        fecha_cita,
        duracion_minutos
      ]
    );

    // Si conflictoRes devuelve alguna fila, significa que hay un solapamiento
    if (conflictoRes.length > 0) {
      // Usamos el código 409 Conflict
      return res.status(409).json({ error: 'Conflicto de horario. El veterinario ya tiene una cita programada en ese rango.' });
    }

    // 2. Insertar la cita (si no hay conflictos)
    const sqlInsert = `
      INSERT INTO Citas (
        id_paciente, id_usuario, fecha_cita, duracion_minutos,
        motivo, tipo_cita, notas, id_clinica
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const insRes = await queryConReintento(
      sqlInsert,
      [
        id_paciente, id_usuario, fecha_cita,
        // --- MODIFICACIÓN 4: duracion_minutos ya no necesita '|| null' ---
        duracion_minutos,
        motivo, tipo_cita, notas && notas.trim().length > 0 ? notas : null, idClinica
      ]
    );

    res.status(201).json({
      message: 'Cita registrada correctamente',
      id: insRes.insertId
    });

    // Audit Log
    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'CREAR',
      entidad: 'Cita',
      id_entidad: insRes.insertId,
      detalles: `Cita programada para la fecha: ${fecha_cita} (Tipo: ${tipo_cita})`
    });
  } catch (error) {
    console.error('Error registrando cita:', error);
    res.status(500).json({ error: 'Error al registrar cita' });
  }
};

module.exports = crearCita;