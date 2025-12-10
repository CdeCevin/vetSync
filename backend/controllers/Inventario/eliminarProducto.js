const connection = require('../../db/connection');
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

const eliminarProducto = async (req, res) => {
    const id_clinica = req.clinicaId;
    const { id } = req.params;

    try {
        // Obtenemos producto para verificar stock
        const productos = await query('SELECT stock FROM Inventario_Items WHERE id = ? AND id_clinica = ? AND Activo = 1', [id, id_clinica]);

        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const producto = productos[0];

        // Requisito VS-006: Solo se pueden desactivar productos con stock actual de 0
        if (producto.stock > 0) {
            return res.status(400).json({ error: 'No se puede eliminar un producto con stock positivo' });
        }


        /*
        // Requisito VS-006: Sin movimientos en los últimos 90 días
        // Verificamos el último movimiento registrado en Movimientos_Inventario
        // Columnas: creado_en, id_item
        const movimientos = await query(`
            SELECT creado_en 
            FROM Movimientos_Inventario 
            WHERE id_item = ? 
            ORDER BY creado_en DESC 
            LIMIT 1
        `, [id]);

        if (movimientos.length > 0) {
            const fechaUltimoMovimiento = new Date(movimientos[0].creado_en);
            const noventaDiasAtras = new Date();
            noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

            if (fechaUltimoMovimiento > noventaDiasAtras) {
                return res.status(400).json({ error: 'No se puede eliminar: el producto tiene movimientos en los últimos 90 días' });
            }
        }

        */
        // Si pasa las validaciones, hacemos Soft Delete
        await query('UPDATE Inventario_Items SET Activo = 0, actualizado_en = NOW() WHERE id = ?', [id]);

        res.json({ message: 'Producto desactivado correctamente (Soft Delete)' });

        // Auditoría
        const logAuditoria = require('../../utils/auditLogger');
        await logAuditoria({
            id_usuario: req.usuario.id,
            id_clinica: id_clinica,
            accion: 'ELIMINAR',
            entidad: 'Inventario',
            id_entidad: id,
            detalles: 'Baja (Soft Delete)'
        });

    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = eliminarProducto;
