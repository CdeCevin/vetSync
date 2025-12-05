const bcrypt = require('bcrypt');  
const { queryConReintento } = require('../../db/queryHelper');  
  
const registroClinica = async (req, res) => {  
  try {  
    // VALIDAR CLAVE MAESTRA PRIMERO  
    const { clave_maestra } = req.headers;  
      
    if (!clave_maestra || clave_maestra !== process.env.MASTER_REGISTRATION_KEY) {  
      return res.status(403).json({ error: 'Clave de registro inválida' });  
    }  
  
    const { nombre_clinica, nombre_admin, correo_electronico, contraseña } = req.body;  
      
    // Validaciones  
    if (!nombre_clinica || !nombre_admin || !correo_electronico || !contraseña) {  
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });  
    }  
  
    // Validar email único globalmente  
    const validarCorreoGlobal = 'SELECT COUNT(*) AS count FROM Usuarios WHERE correo_electronico = ?';  
    const emailResults = await queryConReintento(validarCorreoGlobal, [correo_electronico]);  
      
    if (emailResults[0].count > 0) {  
      return res.status(409).json({ error: 'Este correo ya está registrado' });  
    }  
  
    // Crear clínica  
    const insertClinica = 'INSERT INTO Clinicas (nombre) VALUES (?)';  
    const clinicaResult = await queryConReintento(insertClinica, [nombre_clinica]);  
    const idClinica = clinicaResult.insertId;  
  
    // Crear usuario admin (id_rol = 1)  
    const hash = await bcrypt.hash(contraseña, 10);  
    const insertUsuario = `  
      INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico)  
      VALUES (?, 1, ?, ?, ?)  
    `;  
    await queryConReintento(insertUsuario, [idClinica, hash, nombre_admin, correo_electronico]);  
  
    res.status(201).json({   
      message: 'Clínica y usuario administrador creados',  
      id_clinica: idClinica   
    });  
  } catch (error) {  
    console.error('Error en registro:', error);  
    res.status(500).json({ error: 'Error al registrar clínica' });  
  }  
};  
  
module.exports = registroClinica;