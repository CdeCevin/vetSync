const { queryConReintento } = require('../../db/queryHelper');

const eliminarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const idClinica = req.clinicaId;

    const qDesactivarCitas = `
      UPDATE Citas 
      SET activo = FALSE, estado = 'cancelada' 
      WHERE id_usuario = ? AND id_clinica = ? AND activo = TRUE
    `;

    const qDesactivarUsuario = `
      UPDATE Usuarios 
      SET activo = FALSE
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    await queryConReintento(qDesactivarCitas, [idUsuario, idClinica]);

    const results = await queryConReintento(qDesactivarUsuario, [idUsuario, idClinica]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a esta clínica' });
    }

    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ error: 'Error al desactivar el usuario' });
  }
};

module.exports = eliminarUsuario;
