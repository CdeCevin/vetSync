const { queryConReintento } = require('../../db/queryHelper');

const verUsuario = async (req, res) => {
  try {
    const idClinica = req.params.idClinica;
    const identificador = req.params.identificador;

    let query;
    let params = [idClinica];

    if (/^\d+$/.test(identificador)) {
      query = 'SELECT * FROM Usuarios WHERE id = ? AND id_clinica = ? AND activo = TRUE';
      params.unshift(parseInt(identificador));
    } else {
      query = 'SELECT * FROM Usuarios WHERE nombre_completo LIKE ? AND id_clinica = ? AND activo = TRUE';
      params = [`%${identificador}%`, idClinica];
    }

    const results = await queryConReintento(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error buscando usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

module.exports = verUsuario;
