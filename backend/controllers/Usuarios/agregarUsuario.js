const connection = require('../../db/connection');
const bcrypt = require('bcrypt');

const crearUsuario = (req, res) => {
  const idClinica = req.clinicaId;
  const { id_rol, contraseña, nombre_completo, correo_electronico } = req.body;

  if (!contraseña) {
    return res.status(400).json({ error: 'La contraseña es obligatoria' });
  }
  if (!correo_electronico) {
    return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
  }

  // Validar unicidad del correo electrónico en la clínica
  const validarCorreoQuery = 'SELECT COUNT(*) AS count FROM Usuarios WHERE correo_electronico = ? AND id_clinica = ? AND activo = TRUE';
  connection.query(validarCorreoQuery, [correo_electronico, idClinica], (err, results) => {
    if (err) {
      console.error('Error validando correo:', err);
      return res.status(500).json({ error: 'Error al validar correo electrónico' });
    }
    if (results[0].count > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo en la clínica' });
    }

    // Hashear la contraseña
    bcrypt.hash(contraseña, 10, (hashErr, hash) => {
      if (hashErr) {
        console.error('Error al hashear la contraseña:', hashErr);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      const query = `
        INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico)
        VALUES (?, ?, ?, ?, ?)
      `;

      connection.query(query, [idClinica, id_rol, hash, nombre_completo, correo_electronico], (error, results) => {
        if (error) {
          console.error('Error creando usuario:', error);
          return res.status(500).json({ error: 'Error al crear usuario' });
        }
        res.status(201).json({ message: 'Usuario creado', id: results.insertId });
      });
    });
  });
};

module.exports = crearUsuario;
