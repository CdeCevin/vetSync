const { queryConReintento } = require('../../db/queryHelper');

const verUsuarios = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const query = 'SELECT * FROM Usuarios WHERE id_clinica = ? AND activo = TRUE ORDER BY nombre_completo ASC';
    const results = await queryConReintento(query, [idClinica]);
    res.json(results);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

module.exports = verUsuarios;
