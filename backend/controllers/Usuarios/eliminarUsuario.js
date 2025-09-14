const connection = require('../../db/connection');

const eliminarUsuario = (req, res) => {
  const idUsuario = req.params.id;
  const idClinica = req.clinicaId;

  // Desactivar citas del usuario
  const qDesactivarCitas = `
    UPDATE Citas 
    SET activo = FALSE, estado = 'cancelada' 
    WHERE id_usuario = ? AND id_clinica = ? AND activo = TRUE
  `;

  // Desactivar usuario
  const qDesactivarUsuario = `
    UPDATE Usuarios 
    SET activo = FALSE
    WHERE id = ? AND id_clinica = ? AND activo = TRUE
  `;

  connection.query(qDesactivarCitas, [idUsuario, idClinica], (errCitas) => {
    if (errCitas) {
      console.error('Error desactivando citas:', errCitas);
      return res.status(500).json({ error: 'Error al desactivar las citas del usuario' });
    }

    connection.query(qDesactivarUsuario, [idUsuario, idClinica], (errUsuario, results) => {
      if (errUsuario) {
        console.error('Error desactivando usuario:', errUsuario);
        return res.status(500).json({ error: 'Error al desactivar el usuario' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a esta clínica' });
      }

      res.json({ message: 'Usuario desactivado correctamente' });
    });
  });
};

module.exports = eliminarUsuario;
