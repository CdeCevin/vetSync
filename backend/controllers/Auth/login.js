const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');

const login = async (req, res) => {
  try {
    const { correo_electronico, contraseña } = req.body;

    const query = `
      SELECT u.id, u.nombre_completo, u.hash_contraseña, u.id_rol, r.nombre AS nombre_rol,
             u.id_clinica, c.nombre AS nombre_clinica
      FROM Usuarios u
      JOIN Roles r ON u.id_rol = r.id
      JOIN Clinicas c ON u.id_clinica = c.id
      WHERE u.correo_electronico = ? AND u.activo = 1
    `;

    const results = await queryConReintento(query, [correo_electronico]);

    if (results.length === 0) {
      // Intento de login con usuario no existente
      // No tenemos ID de usuario, así que pasamos null (si la DB lo permite) o no logueamos este caso particular para evitar error FK.
      // Probaremos pasando null.
      await logAuditoria({
        id_usuario: null,
        id_clinica: null, // No sabemos clínica tampoco
        accion: 'LOGIN_FALLIDO',
        entidad: 'Auth',
        id_entidad: 0,
        detalles: `Intento de login fallido.`
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = results[0];

    const igual = await bcrypt.compare(contraseña, usuario.hash_contraseña);

    if (!igual) {
      await logAuditoria({
        id_usuario: usuario.id,
        id_clinica: usuario.id_clinica,
        accion: 'LOGIN_FALLIDO',
        entidad: 'Auth',
        id_entidad: usuario.id,
        detalles: `Intento de login fallido.`
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol,
      id_clinica: usuario.id_clinica,
      nombre_clinica: usuario.nombre_clinica,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
    );

    res.json({
      token,
      usuario: payload,
    });

    // Login Exitoso
    await logAuditoria({
      id_usuario: usuario.id,
      id_clinica: usuario.id_clinica,
      accion: 'LOGIN_EXITOSO',
      entidad: 'Auth',
      id_entidad: usuario.id,
      detalles: `Login exitoso`
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = login;
