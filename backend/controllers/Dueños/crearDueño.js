const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const crearDueno = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const { nombre, telefono, correo, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (!correo) {
      return res.status(400).json({ error: 'El correo es obligatorio' });
    }

    const validarCorreoQuery = 'SELECT COUNT(*) AS count FROM Dueños WHERE correo = ? AND id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(validarCorreoQuery, [correo, idClinica]);

    if (results[0].count > 0) {
      return res.status(409).json({ error: 'Ya existe un dueño con ese correo en la clínica' });
    }

    const query = `
      INSERT INTO Dueños (nombre, telefono, correo, direccion, id_clinica)
      VALUES (?, ?, ?, ?, ?)
    `;

    const insertResults = await queryConReintento(query, [nombre, telefono, correo, direccion, idClinica]);

    // Audit Log
    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'CREAR',
      entidad: 'Dueño',
      id_entidad: insertResults.insertId,
      detalles: `Dueño ${nombre} creado.`
    });

    res.status(201).json({ message: 'Dueño creado', id: insertResults.insertId });
  } catch (error) {
    console.error('Error creando dueño:', error);
    res.status(500).json({ error: 'Error al crear dueño' });
  }
};

module.exports = crearDueno;
