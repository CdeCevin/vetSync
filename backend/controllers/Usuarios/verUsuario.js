const connection = require('../../db/connection');

const verUsuario = (req, res) => {
  const idClinica = req.params.idClinica; // asegúrate que coincida con el nombre del parámetro en la ruta
  const idUsuario = req.params.id;

  const query = 'SELECT * FROM Usuarios WHERE id = ? AND id_clinica = ?';

  connection.query(query, [idUsuario, idClinica], (error, results) => {  // orden: [idUsuario, idClinica]
    if (error) {
      console.error('Error buscando usuario:', error);
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
};

module.exports = verUsuario;
