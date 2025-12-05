const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const estadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const idClinica = req.clinicaId;

    if (!estado) {
      return res.status(400).json({ error: 'El campo "estado" es requerido en el body.' });
    }

    const selectQuery = 'SELECT id, estado, id_usuario FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(selectQuery, [id, idClinica]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
    }

    // Validación de Rol
    if (req.usuario.id_rol === 2 && results[0].id_usuario !== req.usuario.id) {
      return res.status(403).json({ error: 'Acceso denegado. No puedes cambiar el estado de citas de otros veterinarios.' });
    }

    const estadoAnterior = results[0].estado;

    const updateQuery = 'UPDATE Citas SET estado = ? WHERE id = ? AND id_clinica = ?';
    await queryConReintento(updateQuery, [estado, id, idClinica]);

    res.json({ message: 'Estado de la cita actualizado correctamente' });

    // Audit Log
    if (estado !== estadoAnterior) {
      await logAuditoria({
        id_usuario: req.usuario.id,
        id_clinica: idClinica,
        accion: 'CAMBIO_ESTADO',
        entidad: 'Cita',
        id_entidad: id,
        detalles: `Estado cambiado de '${estadoAnterior}' a '${estado}'`
      });
    }
  } catch (err) {
    console.error('Error actualizando estado de la Cita:', err);
    res.status(500).json({ error: 'Error interno del servidor al actualizar la cita' });
  }
};

module.exports = estadoCita;
