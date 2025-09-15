const connection = require('../../db/connection');

const verDueno = (req, res) => {
  const idClinica = req.params.idClinica;
  const identificador = req.params.identificador; // enrutamiento cambiado a /usuarios/:identificador

  let query;
  let params = [idClinica];

  if (/^\d+$/.test(identificador)) {
    // Si identificador es solo números, buscar por ID
    query = 'SELECT * FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE';
    params.unshift(parseInt(identificador)); // idUsuario delante de idClinica
  } else {
    // Buscar por nombre parcial (insensible a mayúsculas según collation)
    query = 'SELECT * FROM Dueños WHERE nombre LIKE ? AND id_clinica = ? AND activo = TRUE';
    params = [`%${identificador}%`, idClinica];
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error buscando dueño:', error);
      return res.status(500).json({ error: 'Error al obtener dueño' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    res.json(results[0]);
  });
};

module.exports = verDueno;
