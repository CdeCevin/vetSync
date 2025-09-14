const connection = require('../../db/connection');

const editarUsuario = (req, res) => {
  const idUsuario = req.params.id;
  const idClinica = req.clinicaId;  // obtenido de prefijo ruta o middleware
  const {
    id_rol,
    hash_contraseña,
    nombre_completo,
    correo_electronico
  } = req.body;

  // Paso 1: Obtener datos actuales filtrando por clínica
  connection.query(
    'SELECT * FROM Usuarios WHERE id = ? AND id_clinica = ?',
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

      // Paso 2: Combinar valores (si no se envían, mantener actuales)
      const nuevoRol = id_rol !== undefined ? id_rol : usuarioActual.id_rol;
      const nuevaHash = hash_contraseña !== undefined ? hash_contraseña : usuarioActual.hash_contraseña;
      const nuevoNombre = nombre_completo !== undefined ? nombre_completo : usuarioActual.nombre_completo;
      const nuevoCorreo = correo_electronico !== undefined ? correo_electronico : usuarioActual.correo_electronico;

      // Paso 3: Actualizar usuario con filtro por clínica
      const query = `
        UPDATE Usuarios 
        SET id_rol = ?, hash_contraseña = ?, nombre_completo = ?, correo_electronico = ?
        WHERE id = ? AND id_clinica = ?
      `;

      connection.query(
        query,
        [nuevoRol, nuevaHash, nuevoNombre, nuevoCorreo, idUsuario, idClinica],
        (error) => {
          if (error) {
            console.error('Error actualizando usuario:', error);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
          }
          res.json({ message: 'Usuario actualizado correctamente' });
        }
      );
    }
  );
};

module.exports = editarUsuario;
