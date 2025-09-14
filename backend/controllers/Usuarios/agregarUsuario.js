const connection = require('../../db/connection');
const bcrypt = require('bcrypt');

const crearUsuario = (req, res) => {
  const idClinica = req.clinicaId;
  const { id_rol, contraseña, nombre_completo, correo_electronico } = req.body;

  // Validar que contraseña exista
  if (!contraseña) {
    return res.status(400).json({ error: 'La contraseña es obligatoria' });
  }

  // Generar hash de la contraseña
  bcrypt.hash(contraseña, 10, (err, hash) => {
    if (err) {
      console.error('Error al hashear la contraseña:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const query = `
      INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
      query,
      [idClinica, id_rol, hash, nombre_completo, correo_electronico],
      (error, results) => {
        if (error) {
          console.error('Error creando usuario:', error);
          return res.status(500).json({ error: 'Error al crear usuario' });
        }
        res.status(201).json({ message: 'Usuario creado', id: results.insertId });
      }
    );
  });
};

module.exports = crearUsuario;
