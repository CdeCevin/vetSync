const { queryConReintento } = require('../../db/queryHelper');

const verDueno = async (req, res) => {
  try {
    const idClinica = req.params.idClinica;
    const identificador = req.params.identificador;

    let query;
    let params = [idClinica];

    if (/^\d+$/.test(identificador)) {
      query = 'SELECT * FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE';
      params.unshift(parseInt(identificador));
    } else {
      query = 'SELECT * FROM Dueños WHERE nombre LIKE ? AND id_clinica = ? AND activo = TRUE';
      params = [`%${identificador}%`, idClinica];
    }

    const results = await queryConReintento(query, params);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error buscando dueño:', error);
    res.status(500).json({ error: 'Error al obtener dueño' });
  }
};

module.exports = verDueno;
