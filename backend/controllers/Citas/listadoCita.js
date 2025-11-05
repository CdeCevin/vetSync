// Este sería tu archivo 'listadoCita.js' (corregido)
const connection = require('../../db/connection');

const listadoCita = (req, res) => {
  // --- 1. Obtener datos del usuario logueado (del JWT) ---
  
  if (!req.usuario) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const idUsuarioLogueado = req.usuario.id;
  const idRolUsuarioLogueado = req.usuario.id_rol;
  const idClinicaDelUsuario = req.usuario.id_clinica;
  
  // --------------------------------------------------------

  let query = `
    SELECT c.*, p.nombre AS nombre_paciente, u.nombre_completo AS nombre_usuario
    FROM Citas c
    JOIN Pacientes p ON c.id_paciente = p.id AND p.activo = TRUE
    JOIN Usuarios u ON c.id_usuario = u.id AND u.activo = TRUE
    WHERE c.id_clinica = ? AND c.activo = TRUE
  `;
  
  // Usamos la clínica del token
  const params = [idClinicaDelUsuario];

  if (idRolUsuarioLogueado !== 3) { 
    query += ` AND c.id_usuario = ?`;
    params.push(idUsuarioLogueado);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error obteniendo listado:', error);
      return res.status(500).json({ error: 'Error al obtener citas' });
    }
    res.json(results);
  });
};

module.exports = listadoCita;