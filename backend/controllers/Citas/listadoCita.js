// listadoUsuarios.js
const connection = require('../../db/connection');

const listadoDuenos = (req, res) => {
  const idClinica = req.clinicaId;
  const query = 'SELECT * FROM Citas WHERE id_clinica = ? AND activo = TRUE';
  connection.query(query, [idClinica], (error, results) => {
    if (error) {
      console.error('Error obteniendo Citas:', error);
      return res.status(500).json({ error: 'Error al obtener Citas' });
    }
    res.json(results);
  });
};

module.exports = listadoDuenos;
