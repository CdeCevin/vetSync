const connection = require('../../db/connection');
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

const estadisticaInventario = async (req, res) => {
    const id_clinica = req.clinicaId;

    try {
        const totalProductos = query(`
            SELECT COUNT(*) as total 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1
        `, [id_clinica]);

        const bajosStockPromise = query(`
            SELECT COUNT(*) as total 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1 AND stock < stock_minimo
        `, [id_clinica]);

        const agotadosPromise = query(`
            SELECT COUNT(*) as total
            FROM Inventario_Items
            WHERE id_clinica = ? AND Activo = 1 
            AND stock = 0
        `, [id_clinica]);



        const [totalResults, bajosResults, agotadosResults] = await Promise.all([
            totalProductos,
            bajosStockPromise,
            agotadosPromise
        ]);

        res.json({
            productosTotales: totalResults[0].total || 0,
            productosBajoStock: bajosResults[0].total || 0,
            productosAgotados: agotadosResults[0].total || 0,
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas de inventario:', error);
        res.status(500).json({ error: 'Error al obtener reportes' });
    }
};

module.exports = estadisticaInventario;
