const connection = require('../../db/connection');
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

const reporteInventario = async (req, res) => {
    const id_clinica = req.clinicaId;

    try {
        // 1. Valor Monetario Total del Inventario
        const valorTotalPromise = query(`
            SELECT SUM(stock * precio) as totalValor
            FROM Inventario_Items
            WHERE id_clinica = ? AND Activo = 1
        `, [id_clinica]);

        // 2. Productos con Bajo Stock
        const bajosStockPromise = query(`
            SELECT COUNT(*) as total 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1 AND stock < stock_minimo
        `, [id_clinica]);

        // 3. Productos Agotados
        const agotadosPromise = query(`
            SELECT COUNT(*) as total
            FROM Inventario_Items
            WHERE id_clinica = ? AND Activo = 1 
            AND stock = 0
        `, [id_clinica]);

        // 4. Últimos Movimientos de Inventario
        const movimientosPromise = query(`
            SELECT 
                m.id,
                m.tipo_movimiento,
                m.cantidad,
                m.motivo,
                m.creado_en,
                i.nombre as producto,
                i.codigo,
                u.nombre_completo as usuario
            FROM Movimientos_Inventario m
            JOIN Inventario_Items i ON m.id_item = i.id
            LEFT JOIN Usuarios u ON m.realizado_por = u.id
            WHERE m.id_clinica = ?
            ORDER BY m.creado_en DESC
            LIMIT 20
        `, [id_clinica]);

        // Ejecutar todas las consultas en paralelo
        const [valorResults, bajosResults, agotadosResults, movimientosResults] = await Promise.all([
            valorTotalPromise,
            bajosStockPromise,
            agotadosPromise,
            movimientosPromise
        ]);

        res.json({
            valorTotal: valorResults[0].totalValor || 0,
            productosBajoStock: bajosResults[0].total || 0,
            productosAgotados: agotadosResults[0].total || 0,
            ultimosMovimientos: movimientosResults
        });

    } catch (error) {
        console.error('Error obteniendo reporte de inventario:', error);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
};

module.exports = reporteInventario;
