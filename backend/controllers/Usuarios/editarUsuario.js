const connection = require('../../db/connection');
const bcrypt = require('bcrypt');

const editarUsuario = (req, res) => {
  const idUsuario = req.params.id;
  const idClinica = req.clinicaId;
  const {
    id_rol,
    contraseña,        // contraseña en texto plano para actualizar (nuevo parámetro)
    nombre_completo,
    correo_electronico
  } = req.body;

  // Paso 1: Obtener datos actuales
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

      // Función para actualizar en base de datos (recibe hash definido)
      const actualizarConHash = (hashContraseña) => {
        const nuevoRol = id_rol !== undefined ? id_rol : usuarioActual.id_rol;
        const nuevoNombre = nombre_completo !== undefined ? nombre_completo : usuarioActual.nombre_completo;
        const nuevoCorreo = correo_electronico !== undefined ? correo_electronico : usuarioActual.correo_electronico;

        const query = `
          UPDATE Usuarios 
          SET id_rol = ?, hash_contraseña = ?, nombre_completo = ?, correo_electronico = ?
          WHERE id = ? AND id_clinica = ?
        `;

        connection.query(
          query,
          [nuevoRol, hashContraseña, nuevoNombre, nuevoCorreo, idUsuario, idClinica],
          (error) => {
            if (error) {
              console.error('Error actualizando usuario:', error);
              return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.json({ message: 'Usuario actualizado correctamente' });
          }
        );
      };

      // Si recibimos nueva contraseña, hacer hash primero
      if (contraseña !== undefined && contraseña !== '') {
        bcrypt.hash(contraseña, 10, (hashErr, hash) => {
          if (hashErr) {
            console.error('Error hasheando la contraseña:', hashErr);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          actualizarConHash(hash);
        });
      } else {
        // No hay contraseña nueva, mantenemos hash actual
        actualizarConHash(usuarioActual.hash_contraseña);
      }
    }
  );
};

module.exports = editarUsuario;
