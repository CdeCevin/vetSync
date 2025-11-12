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

    if (!id_paciente || !id_usuario || !fecha_cita || !motivo || !tipo_cita || !idClinica) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (id_paciente, id_usuario, fecha_cita, motivo, tipo_cita, idClinica)' });
    }

    if (isNaN(Date.parse(fecha_cita))) {
      return res.status(400).json({ error: 'Formato de fecha_cita inválido' });
    }

    if (duracion_minutos !== undefined && (typeof duracion_minutos !== 'number' || duracion_minutos <= 0)) {
      return res.status(400).json({ error: 'duracion_minutos debe ser un número positivo' });
    }

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

    const sqlInsert = `
      INSERT INTO Citas (
        id_paciente, id_usuario, fecha_cita, duracion_minutos,
        motivo, tipo_cita, notas, id_clinica
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const insRes = await queryConReintento(
      sqlInsert,
      [
        id_paciente, id_usuario, fecha_cita, duracion_minutos || null,
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
