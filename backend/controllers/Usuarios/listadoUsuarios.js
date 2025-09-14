// listadoUsuarios.js
const connection = require('../../db/connection');

const verUsuarios = (req, res) => {
  const idClinica = req.clinicaId;
  const query = 'SELECT * FROM Usuarios WHERE id_clinica = ?';
  connection.query(query, [idClinica], (error, results) => {
    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
};

module.exports = verUsuarios;
