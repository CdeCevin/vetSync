// agregarUsuario.js
const connection = require('../../db/connection');

const crearUsuario = (req, res) => {
  const idClinica = req.clinicaId;
  const { id_rol, hash_contraseña, nombre_completo, correo_electronico } = req.body;

  const query = `
    INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [idClinica, id_rol, hash_contraseña, nombre_completo, correo_electronico],
    (error, results) => {
      if (error) {
        console.error('Error creando usuario:', error);
        return res.status(500).json({ error: 'Error al crear usuario' });
      }
      res.status(201).json({ message: 'Usuario creado', id: results.insertId });
    }
  );
};

module.exports = crearUsuario;
