// listadoInventario.js
const connection = require('../../db/connection');

const listadoInventario = (req, res) => {
  const idClinica = req.clinicaId;

  const query = 'SELECT id, tipo, descripcion, stock, stock_minimo, fecha_expiracion, proveedor FROM Inventario_Items WHERE id_clinica = ? AND Activo = 1';
  connection.query(query, [idClinica], (error, results) => {
    if (error) {
      console.error('Error obteniendo inventario:', error);
      return res.status(500).json({ error: 'Error al obtener inventario' });
    }

    const resultsWithStatus = results.map(item => {
      let estado = 'en stock';
      if (item.stock === 0) {
        estado = 'sin stock';
      } else if (item.stock < item.stock_minimo) {
        estado = 'stock bajo';
      }
      return { ...item, Estado: estado };
    });

    res.json(resultsWithStatus);
  });
};


module.exports = listadoInventario;
