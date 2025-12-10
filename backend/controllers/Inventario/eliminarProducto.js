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

        if (producto.stock > 0) {
            return res.status(400).json({ error: 'No se puede eliminar un producto con stock positivo' });
        }

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
