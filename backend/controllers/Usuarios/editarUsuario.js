const { queryConReintento } = require('../../db/queryHelper');
const bcrypt = require('bcrypt');

const editarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const idClinica = req.clinicaId;
    const {
      id_rol,
      contraseña,
      nombre_completo,
      correo_electronico
    } = req.body;

    const results = await queryConReintento(
      'SELECT * FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE',
      [idUsuario, idClinica]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o no pertenece a esta clínica' });
    }

    const usuarioActual = results[0];

    if (correo_electronico && correo_electronico !== usuarioActual.correo_electronico) {
      const queryValidarCorreo = `
        SELECT COUNT(*) AS count FROM Usuarios 
        WHERE correo_electronico = ? AND id_clinica = ? AND activo = TRUE AND id != ?
      `;
      const res2 = await queryConReintento(queryValidarCorreo, [correo_electronico, idClinica, idUsuario]);

      if (res2[0].count > 0) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado en otro usuario' });
      }
    }

    let hashContraseña = usuarioActual.hash_contraseña;

    if (contraseña !== undefined && contraseña !== '') {
      hashContraseña = await bcrypt.hash(contraseña, 10);
    }

    const nuevoRol = id_rol !== undefined ? id_rol : usuarioActual.id_rol;
    const nuevoNombre = nombre_completo !== undefined ? nombre_completo : usuarioActual.nombre_completo;
    const nuevoCorreo = correo_electronico !== undefined ? correo_electronico : usuarioActual.correo_electronico;

    const queryUpdate = `
      UPDATE Usuarios 
      SET id_rol = ?, hash_contraseña = ?, nombre_completo = ?, correo_electronico = ?
      WHERE id = ? AND id_clinica = ?
    `;

    await queryConReintento(
      queryUpdate,
      [nuevoRol, hashContraseña, nuevoNombre, nuevoCorreo, idUsuario, idClinica]
    );

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

module.exports = editarUsuario;
