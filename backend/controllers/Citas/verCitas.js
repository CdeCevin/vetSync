const connection = require('../../db/connection');

const verCita = (req, res) => {
console.log('HOLAAAAAAAAAAAAAAAAAAA');
  if (!req.usuario) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const idUsuarioLogueado = req.usuario.id;
  const idRolUsuarioLogueado = req.usuario.id_rol;

  const idClinicaDelUsuario = req.usuario.id_clinica; 

  const identificador = req.params.identificador;
  console.log('Identificador recibido:', identificador);
  

  let query = `
    SELECT c.*, p.nombre AS nombre_paciente, u.nombre_completo AS nombre_usuario
    FROM Citas c
    JOIN Pacientes p ON c.id_paciente = p.id AND p.activo = TRUE
    JOIN Usuarios u ON c.id_usuario = u.id AND u.activo = TRUE
    WHERE c.id_clinica = ? AND c.activo = TRUE
  `;

  // Usamos la clínica del usuario logueado para el primer filtro
  const params = [idClinicaDelUsuario];

  if (idRolUsuarioLogueado !== 3) {
    query += ` AND c.id_usuario = ?`;
    params.push(idUsuarioLogueado);
  }
  // Si ES Rol 3, este filtro se omite y verá todo lo de la clínica.
  // -----------------------------------------------------

  // --- 4. LÓGICA DE BÚSQUEDA (Tu código original) ---
  if (/^\d+$/.test(identificador)) {
    // Si es número puede ser id_paciente, id_usuario o id cita
    query += ` AND (c.id_paciente = ? OR c.id_usuario = ? OR c.id = ?)`;
    params.push(identificador, identificador, identificador);
  } else {
    // Si es string buscar por nombre paciente o usuario (LIKE insensible)
    query += ` AND (p.nombre LIKE ? OR u.nombre_completo LIKE ?)`;
    params.push(`%${identificador}%`, `%${identificador}%`);
  }
  // -----------------------------------------------------

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error buscando cita:', error);
      return res.status(500).json({ error: 'Error al obtener cita' });
    }
    if (results.length === 0) {
      // Es importante no dar error 404 si es un admin (puede ser que
      // la búsqueda no arrojó nada), pero sí si un usuario normal
      // intenta buscar algo que no le pertenece.
      return res.status(404).json({ error: 'Cita no encontrada o sin permisos para verla' });
    }
    res.json(results);
  });
};

module.exports = verCita;