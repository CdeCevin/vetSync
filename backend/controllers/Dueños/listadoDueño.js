const { queryConReintento } = require('../../db/queryHelper');

const listadoDuenos = async (req, res) => {
  try {
    const idClinica = req.clinicaId;
    const query = 'SELECT * FROM Dueños WHERE id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(query, [idClinica]);
    res.json(results);
  } catch (error) {
    console.error('Error obteniendo dueños:', error);
    res.status(500).json({ error: 'Error al obtener dueños' });
  }
};

module.exports = listadoDuenos;
