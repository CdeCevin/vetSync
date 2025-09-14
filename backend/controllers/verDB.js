const connection = require('../db/connection');

const verClinicas = (req, res) => {
  connection.query('SELECT * FROM Usuarios WHERE id_clinica = 1', (error, results) => {
    if (error) {
      console.error('Error al obtener las clínicas:', error);
      return res.status(500).json({ error: 'Error al obtener las clínicas' });
    }
    res.json(results);
  });
};

module.exports = { verClinicas };
