const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');
const eliminarCita = async (req, res) => {
  try {
    const idCita = req.params.id;
    const idClinica = req.clinicaId;

    const results = await queryConReintento(
      'SELECT * FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE',
      [idCita, idClinica]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
    }

    // Validación de Rol
    if (req.usuario.id_rol === 2 && results[0].id_usuario !== req.usuario.id) {
      return res.status(403).json({ error: 'Acceso denegado. No puedes eliminar citas de otros veterinarios.' });
    }

    const query = `
      UPDATE Citas
      SET activo = FALSE, estado = 'cancelada'
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    const resultsUpdate = await queryConReintento(query, [idCita, idClinica]);

    if (resultsUpdate.affectedRows === 0) {
      return res.status(404).json({ message: 'Cita ya estaba desactivada' });
    }

    res.json({ message: 'Cita desactivada correctamente' });

    // Audit Log
    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'CANCELAR',
      entidad: 'Cita',
      id_entidad: idCita,
      detalles: `Cita ${idCita} cancelada/desactivada.`
    });
  } catch (error) {
    console.error('Error desactivando cita:', error);
    res.status(500).json({ error: 'Error al desactivar cita' });
  }
};

module.exports = eliminarCita;
