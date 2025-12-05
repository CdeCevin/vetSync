const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const crearPaciente = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const {
      nombre,
      especie,
      raza,
      color,
      edad,
      peso,
      numero_microchip,
      id_dueño
    } = req.body;

    if (!nombre || !id_dueño || !idClinica) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (nombre, id_dueño, id_clinica)' });
    }

    const queryDueno = `
      SELECT id FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;
    const results = await queryConReintento(queryDueno, [id_dueño, idClinica]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'El dueño indicado no existe o no está activo' });
    }

    const queryPaciente = `
      INSERT INTO Pacientes (nombre, especie, raza, color, edad, peso, numero_microchip, id_dueño, id_clinica)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertResults = await queryConReintento(
      queryPaciente,
      [nombre, especie, raza, color, edad, peso, numero_microchip, id_dueño, idClinica]
    );

    // Registro de auditoría
    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'CREAR',
      entidad: 'Paciente',
      id_entidad: insertResults.insertId,
      detalles: `Paciente ${nombre} (${especie}) creado.`
    });

    res.status(201).json({ message: 'Paciente creado correctamente', id: insertResults.insertId });
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

module.exports = crearPaciente;
