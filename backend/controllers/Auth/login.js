const connection = require('../../db/connection');
const bcrypt = require('bcrypt');  // Para hashing de contraseñas, si las usas

const login = (req, res) => {
  const { correo_electronico, contraseña } = req.body;

  // Consulta para obtener usuario con rol y clínica relacionada
  const query = `
    SELECT u.id, u.nombre_completo, u.hash_contraseña, u.id_rol, r.nombre AS nombre_rol, 
           u.id_clinica, c.nombre AS nombre_clinica
    FROM Usuarios u 
    JOIN Roles r ON u.id_rol = r.id
    JOIN Clinicas c ON u.id_clinica = c.id
    WHERE u.correo_electronico = ?
  `;

  connection.query(query, [correo_electronico], (error, results) => {
    if (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = results[0];

    // Verificar contraseña (si usas bcrypt)
    bcrypt.compare(contraseña, usuario.hash_contraseña, (err, igual) => {
      if (err) {
        console.error('Error comparando contraseña:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!igual) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Login exitoso, enviar datos requeridos sin hash de contraseña
      res.json({
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        id_rol: usuario.id_rol,
        nombre_rol: usuario.nombre_rol,
        id_clinica: usuario.id_clinica,
        nombre_clinica: usuario.nombre_clinica,
      });
    });
  });
};

module.exports = login;
