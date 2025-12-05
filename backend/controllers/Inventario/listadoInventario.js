const connection = require('../../db/connection');

const listadoInventario = (req, res) => {
  const idClinica = req.clinicaId;
  // Se mapean las columnas de la BD a los nombres de campos requeridos por el Frontend
  const query = `
    SELECT 
        id, 
        codigo, 
        nombre, 
        tipo as categoria, 
        descripcion, 
        stock as stockActual, 
        stock_minimo as stockMinimo, 
        unidad_medida as unidadMedida, 
        precio as costoUnitario, 
        fecha_expiracion as fechaExpiracion, 
        Activo 
    FROM Inventario_Items 
    WHERE id_clinica = ? AND Activo = 1
  `;

  connection.query(query, [idClinica], (error, results) => {
    if (error) {
      console.error('Error obteniendo inventario:', error);
      return res.status(500).json({ error: 'Error al obtener inventario' });
    }

    const resultsWithStatus = results.map(item => {
      // Estado logic: "activo" if Activo=1 (which is filtered in query), 
      // but user might mean "Estado de Stock"?
      // User example showed "estado": "activo".
      // We will keep 'activo' as the item state. 
      // If frontend needs stock status (Green/Yellow/Red), it might process it or we send it.
      // The VS-002 requirement mentioned "visual status indicators". 
      // The user example shows "estado": "activo". I will return "activo".

      return {
        id: item.id.toString(), // Frontend expects string ID usually
        codigo: item.codigo,
        nombre: item.nombre,
        categoria: item.categoria,
        descripcion: item.descripcion,
        stockActual: item.stockActual,
        stockMinimo: item.stockMinimo,
        unidadMedida: item.unidadMedida,
        costoUnitario: item.costoUnitario,
        fechaExpiracion: item.fechaExpiracion,
        estado: 'activo'
      };
    });

    res.json(resultsWithStatus);
  });
};

module.exports = listadoInventario;
