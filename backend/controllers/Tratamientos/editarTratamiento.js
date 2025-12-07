const db = require('../../db/connection');

exports.editarTratamiento = async (req, res) => {
    const { id } = req.params;
    const {
        id_medicamento,
        dosis,
        cantidad,
        instrucciones,
        duracion_dias,
        notas,
        usuario_editor
    } = req.body;

    const id_clinica = req.clinicaId;

    if (!id || !id_medicamento || !cantidad) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para editar.' });
    }

    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 1. Obtener tratamiento actual
        const [rows] = await connection.query(
            'SELECT * FROM Tratamientos WHERE id = ? AND id_clinica = ? FOR UPDATE',
            [id, id_clinica]
        );

        if (rows.length === 0) {
            throw new Error('Tratamiento no encontrado o no pertenece a esta clínica');
        }

        const tratamientoActual = rows[0];
        const oldMedId = tratamientoActual.id_medicamento;
        const oldCant = tratamientoActual.cantidad;
        const newMedId = id_medicamento;
        const newCant = cantidad;

        // Comprobar si hubo cambios en inventario
        if (oldMedId != newMedId || oldCant != newCant) {

            // A. Devolver stock del medicamento anterior
            if (oldMedId) {
                await connection.query(
                    'UPDATE Inventario_Items SET cantidad_inicial = cantidad_inicial + ? WHERE id = ?',
                    [oldCant, oldMedId]
                );

                await connection.query(
                    'INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_clinica, usuario_editor || tratamientoActual.prescripto_por, 'ENTRADA', oldCant, `Devolución por edición de Tratamiento #${id}`, oldMedId]
                );
            }

            // B. Descontar stock del nuevo
            const [stockRows] = await connection.query(
                'SELECT cantidad_inicial, descripcion FROM Inventario_Items WHERE id = ? AND id_clinica = ? FOR UPDATE',
                [newMedId, id_clinica]
            );

            if (stockRows.length === 0) {
                throw new Error('El medicamento seleccionado no existe en el inventario.');
            }

            const nuevoStock = stockRows[0].cantidad_inicial;

            if (nuevoStock < newCant) {
                throw new Error(`Stock insuficiente para ${stockRows[0].descripcion}. Disponible: ${nuevoStock}, Solicitado: ${newCant}`);
            }

            await connection.query(
                'UPDATE Inventario_Items SET cantidad_inicial = cantidad_inicial - ? WHERE id = ?',
                [newCant, newMedId]
            );

            await connection.query(
                'INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                [id_clinica, usuario_editor || tratamientoActual.prescripto_por, 'SALIDA', newCant, `Ajuste por edición de Tratamiento #${id}`, newMedId]
            );
        }

        // 2. Actualizar Tratamiento (Set editado = 1)
        const queryUpdate = `
            UPDATE Tratamientos 
            SET id_medicamento=?, dosis=?, cantidad=?, instrucciones=?, duracion_dias=?, notas=?, editado=TRUE
            WHERE id=?
        `;

        await connection.query(queryUpdate, [
            newMedId,
            dosis,
            newCant,
            instrucciones,
            duracion_dias,
            notas,
            id
        ]);

        // 3. Auditoría
        await connection.query(
            'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
            [
                usuario_editor || tratamientoActual.prescripto_por,
                id_clinica,
                'EDITAR',
                'Tratamientos',
                id,
                `Edición de tratamiento. Cambios en medicamento/cantidad: ${oldMedId != newMedId || oldCant != newCant}`
            ]
        );

        await connection.commit();
        res.json({ message: 'Tratamiento actualizado correctamente' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al editar tratamiento:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
