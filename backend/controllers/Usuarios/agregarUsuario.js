const bcrypt = require('bcrypt');
const connection = require('../../db/connection');

const editarUsuario = (req, res) => {
  const idUsuario = req.params.id;
  const idClinica = req.clinicaId;
  const {
    id_rol,
    contraseña,         // ahora recibimos contraseña en texto plano
    nombre_completo,
    correo_electronico
  } = req.body;

  connection.query(
    'SELECT * FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE',
    [idUsuario, idClinica],
    (err, results) => {
      if (err) {
        console.error('Error buscando usuario:', err);
        return res.status(500).json({ error: 'Error al buscar usuario' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a esta clínica' });
      }

      const usuarioActual = results[0];

      // Función para actualizar el usuario con el hash de contraseña ya definido
      const actualizarUsuarioConHash = (hash) => {
        const query = `
          UPDATE Usuarios 
          SET id_rol = ?, hash_contraseña = ?, nombre_completo = ?, correo_electronico = ?
          WHERE id = ? AND id_clinica = ?
        `;

        const nuevoRol = id_rol !== undefined ? id_rol : usuarioActual.id_rol;
        const nuevoHash = hash !== undefined ? hash : usuarioActual.hash_contraseña;
        const nuevoNombre = nombre_completo !== undefined ? nombre_completo : usuarioActual.nombre_completo;
        const nuevoCorreo = correo_electronico !== undefined ? correo_electronico : usuarioActual.correo_electronico;

        connection.query(
          query,
          [nuevoRol, nuevoHash, nuevoNombre, nuevoCorreo, idUsuario, idClinica],
          (error) => {
            if (error) {
              console.error('Error actualizando usuario:', error);
              return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.json({ message: 'Usuario actualizado correctamente' });
          }
        );
      };

      // Si recibimos nueva contraseña, cifrarla, sino actualizar con la actual
      if (contraseña !== undefined && contraseña !== '') {
        bcrypt.hash(contraseña, 10, (errHash, hash) => {
          if (errHash) {
            console.error('Error al hashear la contraseña:', errHash);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          actualizarUsuarioConHash(hash);
        });
      } else {
        // No se actualiza la contraseña, mantenemos la existente
        actualizarUsuarioConHash(usuarioActual.hash_contraseña);
      }
    }
  );
};

module.exports = editarUsuario;
