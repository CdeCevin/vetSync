const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const eliminarPaciente = async (req, res) => {
  try {
    const idPaciente = req.params.id;
    const idClinica = req.clinicaId;

    const query = `
      UPDATE Pacientes 
      SET activo = FALSE 
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    const results = await queryConReintento(query, [idPaciente, idClinica]);

    // Registro de auditoría (si se afectó alguna fila, aunque la lógica original chequea affectedRows después, es mejor loguear solo si hubo cambio real)

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado o ya desactivado' });
    }

    res.json({ message: 'Paciente desactivado correctamente' });

    // Log después de respuesta exitosa o antes, aqui lo ponemos antes de enviar (o justo aqui si affectedRows > 0)
    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'ELIMINAR',
      entidad: 'Paciente',
      id_entidad: idPaciente,
      detalles: `Paciente ${idPaciente} eliminado (desactivado).`
    });
  } catch (error) {
    console.error('Error desactivando paciente:', error);
    res.status(500).json({ error: 'Error al desactivar paciente' });
  }
};

module.exports = eliminarPaciente;
