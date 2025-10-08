const connection = require('../../db/connection');

const crearCita = (req, res) => {
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

  // Validación mínima
  if (!id_paciente || !id_usuario || !fecha_cita || !motivo || !tipo_cita || !idClinica) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (id_paciente, id_usuario, fecha_cita, motivo, tipo_cita, idClinica)' });
  }

  // Validar fecha mínima formateada (opcional)
  if (isNaN(Date.parse(fecha_cita))) {
    return res.status(400).json({ error: 'Formato de fecha_cita inválido' });
  }

  // Validar duración (si es provista)
  if (duracion_minutos !== undefined && (typeof duracion_minutos !== 'number' || duracion_minutos <= 0)) {
    return res.status(400).json({ error: 'duracion_minutos debe ser un número positivo' });
  }

  // Validar existencia de paciente y usuario activos
  const sqlCheck =
    `SELECT 
       (SELECT id FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS paciente, 
       (SELECT id FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE) AS usuario`;

  connection.query(sqlCheck, [id_paciente, idClinica, id_usuario, idClinica], (checkErr, checkRes) => {
    if (checkErr) {
      console.error('Error validando datos:', checkErr);
      return res.status(500).json({ error: 'Error al validar referencias' });
    }

    const pacienteExiste = checkRes[0].paciente !== null;
    const usuarioExiste = checkRes[0].usuario !== null;

    if (!pacienteExiste) {
      return res.status(404).json({ error: 'Paciente no encontrado o inactivo en clínica' });
    }
    if (!usuarioExiste) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo en clínica' });
    }

    // Insertar cita
    const sqlInsert = `
      INSERT INTO Citas (
        id_paciente, id_usuario, fecha_cita, duracion_minutos,
        motivo, tipo_cita, notas, id_clinica
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
      sqlInsert,
      [
        id_paciente, id_usuario, fecha_cita, duracion_minutos || null,
        motivo, tipo_cita, notas && notas.trim().length > 0 ? notas : null, idClinica
      ],
      (insErr, insRes) => {
        if (insErr) {
          console.error('Error registrando cita:', insErr);
          return res.status(500).json({ error: 'Error al registrar cita' });
        }

        res.status(201).json({
          message: 'Cita registrada correctamente',
          id: insRes.insertId
        });
      }
    );
  });
};

module.exports = crearCita;
