const { queryConReintento } = require('../../db/queryHelper');

const crearCita = async (req, res) => {
  try {
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
        -- Opcional: Si tienes un campo 'estado', filtra solo citas activas/confirmadas
        -- AND estado NOT IN ('Cancelada', 'Rechazada') 
        AND (
          ? < DATE_ADD(fecha_cita, INTERVAL duracion_minutos MINUTE)
          AND
          DATE_ADD(?, INTERVAL ? MINUTE) > fecha_cita
        )
      LIMIT 1`;

    const conflictoRes = await queryConReintento(
      sqlCheckConflicto,
      [
        id_usuario,       // id_usuario = ?
        idClinica,        // id_clinica = ?
        fecha_cita,       // ? (NuevaCita_Inicio)
        fecha_cita,       // ? (base para NuevaCita_Fin)
        duracion_minutos  // ? (intervalo para NuevaCita_Fin)
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
  } catch (error) {
    console.error('Error registrando cita:', error);
    res.status(500).json({ error: 'Error al registrar cita' });
  }
};

module.exports = crearCita;