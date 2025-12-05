const pool = require('../../db/connection');
const util = require('util');

const actualizarProducto = async (req, res) => {
    const id_clinica = req.clinicaId;
    const { id } = req.params;
    const {
        // Campos para edición de info
        nombre,
        categoria,
        descripcion,
        stockMinimo,
        unidadMedida,
        costoUnitario,

        // Campos para movimiento de stock
        tipo, // 'entrada', 'salida', 'ajuste'
        cantidad,
        motivo
    } = req.body;

    const id_usuario = req.usuario.id;

    console.log("antes queryPool")
    const queryPool = util.promisify(pool.query).bind(pool);
    const getConnection = util.promisify(pool.getConnection).bind(pool);
    console.log("despues queryPool")

    try {
        const checkProduct = await queryPool('SELECT * FROM Inventario_Items WHERE id = ? AND id_clinica = ? AND Activo = 1', [id, id_clinica]);

        if (checkProduct.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const productoActual = checkProduct[0];

        // --- Lógica de Movimiento de Stock (VS-005) ---
        if (tipo && cantidad !== undefined) {
            if (cantidad < 0) return res.status(400).json({ error: 'La cantidad debe ser positiva' });

            let nuevoStock = productoActual.stock;
            // No necesitamos mapear accionAudit para el Audit Log antiguo, 
            // pero lo usabamos antes. Ahora usamos Movimientos_Inventario.

            switch (tipo) {
                case 'entrada':
                    nuevoStock += parseInt(cantidad);
                    break;
                case 'salida':
                    if (productoActual.stock < cantidad) {
                        return res.status(400).json({ error: 'Stock insuficiente' });
                    }
                    nuevoStock -= parseInt(cantidad);
                    break;
                case 'ajuste':
                    nuevoStock = parseInt(cantidad);
                    break;
                default:
                    return res.status(400).json({ error: 'Tipo de movimiento inválido' });
            }

            // OBTENER CONEXIÓN DEDICADA PARA LA TRANSACCIÓN
            const connection = await getConnection();

            // Promisify methods of the dedicated connection
            const queryTx = util.promisify(connection.query).bind(connection);
            const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
            const commit = util.promisify(connection.commit).bind(connection);
            const rollback = util.promisify(connection.rollback).bind(connection);

            try {
                await beginTransaction();

                // 1. Update Stock
                await queryTx('UPDATE Inventario_Items SET stock = ?, actualizado_en = NOW() WHERE id = ?', [nuevoStock, id]);

                // 2. Registrar Movimiento en Movimientos_Inventario
                // Columnas: id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, creado_en, id_item
                await queryTx(`
                    INSERT INTO Movimientos_Inventario 
                    (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, creado_en, id_item) 
                    VALUES (?, ?, ?, ?, ?, NOW(), ?)
                `, [id_clinica, id_usuario, tipo, cantidad, motivo || 'Sin motivo', id]);

                await commit();
                return res.json({ message: 'Stock actualizado correctamente', nuevoStock });

            } catch (txError) {
                await rollback();
                throw txError;
            } finally {
                connection.release(); // IMPORTANTE: Devolver la conexión al pool
            }
        }

        // --- Lógica de Actualización de Información (VS-004) ---
        if (nombre || categoria || stockMinimo !== undefined || unidadMedida || costoUnitario !== undefined || descripcion !== undefined) {

            if (nombre && nombre !== productoActual.nombre) {
                const checkName = await queryPool('SELECT id FROM Inventario_Items WHERE nombre = ? AND id_clinica = ? AND id != ? AND Activo = 1', [nombre, id_clinica, id]);
                if (checkName.length > 0) {
                    return res.status(409).json({ error: 'Ya existe otro producto con este nombre' });
                }
            }

            const updates = [];
            const values = [];

            if (nombre) { updates.push('nombre = ?'); values.push(nombre); }
            if (categoria) { updates.push('tipo = ?'); values.push(categoria); }
            if (descripcion !== undefined) { updates.push('descripcion = ?'); values.push(descripcion); }
            if (stockMinimo !== undefined) { updates.push('stock_minimo = ?'); values.push(stockMinimo); }
            if (unidadMedida) { updates.push('unidad_medida = ?'); values.push(unidadMedida); }
            if (costoUnitario !== undefined) { updates.push('precio = ?'); values.push(costoUnitario); }

            updates.push('actualizado_en = NOW()');
            values.push(id);

            const updateQuery = `UPDATE Inventario_Items SET ${updates.join(', ')} WHERE id = ?`;
            await queryPool(updateQuery, values);

            // También logueamos la edición en Auditoría si se desea, 
            // pero el usuario priorizó Movimientos para stock. 
            // Mantendré el log de auditoría general (opcional) o lo quito si causa ruido.
            // Lo dejaré comentado o activo si no rompe nada.
            // Para simplicidad y evitar errores de contexto, lo omito ahora o uso queryPool.

            await queryPool(`
                INSERT INTO Registros_Auditoria 
                (accion, entidad, id_entidad, id_usuario, detalles, id_clinica, creado_en)
                VALUES ('EDITAR_PRODUCTO', 'Inventario', ?, ?, ?, ?, NOW())
            `, [id, id_usuario, JSON.stringify({ cambios: req.body }), id_clinica]);

            return res.json({ message: 'Producto actualizado correctamente' });
        }

        return res.status(400).json({ error: 'No se enviaron datos para actualizar' });

    } catch (error) {
        console.error('Error en actualizarProducto:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = actualizarProducto;
