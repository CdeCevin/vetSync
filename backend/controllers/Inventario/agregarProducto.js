const connection = require('../../db/connection');

const agregarProducto = (req, res) => {
    const id_clinica = req.clinicaId;
    const {
        codigo,
        nombre,
        categoria,
        descripcion,
        stockActual,
        stockMinimo,
        unidadMedida,
        fechaExpiracion,
        costoUnitario
    } = req.body;

    if (!codigo || !nombre || !categoria || stockActual === undefined || stockMinimo === undefined || !unidadMedida || !costoUnitario) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (stockActual < 0) {
        return res.status(400).json({ error: 'El stock inicial no puede ser negativo' });
    }

    const checkQuery = 'SELECT id FROM Inventario_Items WHERE codigo = ? AND id_clinica = ? AND Activo = 1';

    connection.query(checkQuery, [codigo, id_clinica], (error, results) => {
        if (error) {
            console.error('Error verificando duplicados:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Ya existe un producto con ese código en el inventario activo' });
        }

        // Insertar producto
        const insertQuery = `
            INSERT INTO Inventario_Items 
            (id_clinica, codigo, nombre, tipo, descripcion, stock, stock_minimo, unidad_medida, fecha_expiracion, precio, Activo, creado_en, actualizado_en) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;

        const values = [
            id_clinica,
            codigo,
            nombre,
            categoria,
            descripcion || null,
            stockActual,
            stockMinimo,
            unidadMedida,
            fechaExpiracion || null,
            costoUnitario
        ];

        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error agregando producto:', err);
                return res.status(500).json({ error: 'Error al agregar el producto' });
            }

            res.status(201).json({
                message: 'Producto agregado exitosamente',
                id: result.insertId
            });

            // Auditoría
            const logAuditoria = require('../../utils/auditLogger');
            logAuditoria({
                id_usuario: req.usuario.id,
                id_clinica: id_clinica,
                accion: 'CREAR',
                entidad: 'Inventario',
                id_entidad: result.insertId,
                detalles: `Código: ${codigo}, Nombre: ${nombre}`
            });
        });
    });
};

module.exports = agregarProducto;
