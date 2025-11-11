const { queryConReintento } = require('../../db/queryHelper');
const bcrypt = require('bcrypt');

const crearUsuario = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const { id_rol, contraseña, nombre_completo, correo_electronico } = req.body;

    if (!contraseña) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }
    if (!correo_electronico) {
      return res.status(400).json({ error: 'El correo electrónico es obligatorio' });
    }

    const validarCorreoQuery = 'SELECT COUNT(*) AS count FROM Usuarios WHERE correo_electronico = ? AND id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(validarCorreoQuery, [correo_electronico, idClinica]);

    if (results[0].count > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo en la clínica' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const query = `
      INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico)
      VALUES (?, ?, ?, ?, ?)
    `;

    const insertResults = await queryConReintento(query, [idClinica, id_rol, hash, nombre_completo, correo_electronico]);

    res.status(201).json({ message: 'Usuario creado', id: insertResults.insertId });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

module.exports = crearUsuario;
