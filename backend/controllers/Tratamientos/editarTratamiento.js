const pool = require('../../db/connection');

exports.editarTratamiento = (req, res) => {
    const { id } = req.params;
    const usuario_editor = req.usuario.id;
    const {
        id_medicamento,
        dosis,
        cantidad,
        instrucciones,
        duracion_dias,
        notas,
        id_paciente,
        prescripto_por
    } = req.body;

    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del tratamiento' });
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error al obtener conexión:", err);
            return res.status(500).json({ error: "Error de conexión" });
        }
        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: "Error al iniciar transacción" });
            }
            // 1. Obtener tratamiento actual (Lock for update para evitar race conditions en stock)
            connection.query(
                'SELECT * FROM Tratamientos WHERE id = ? AND id_clinica = ? FOR UPDATE',
                [id, id_clinica],
                (err, rows) => {
                    if (err) {
                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error consultando tratamiento" }); });
                    }

                    if (rows.length === 0) {
                        return connection.rollback(() => {
                            connection.release(); res.status(404).json({ error: 'Tratamiento no encontrado o no pertenece a esta clínica' });
                        });
                    }

                    const tratamientoActual = rows[0];

                    // Valores a usar (Nuevos o los que ya tenía)
                    const oldMedId = tratamientoActual.id_medicamento;
                    const oldCant = tratamientoActual.cantidad;

                    const newMedId = id_medicamento !== undefined ? id_medicamento : oldMedId;
                    const newCant = cantidad !== undefined ? cantidad : oldCant;

                    // 2. Lógica de Inventario (Solo si cambia medicamento o cantidad)
                    const handleInventory = (callback) => {
                        const needsStockAdjustment = (oldMedId != newMedId) || (oldCant != newCant);

                        if (needsStockAdjustment) {
                            // A. Devolver stock anterior
                            const returnStock = (next) => {
                                if (oldMedId) {
                                    connection.query('UPDATE Inventario_Items SET stock = stock + ? WHERE id = ?', [oldCant, oldMedId], (err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error devolviendo stock" }); });

                                        connection.query('INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                                            [id_clinica, usuario_editor, 'ENTRADA', oldCant, `Devolución auto: Edición Tratamiento #${id}`, oldMedId],
                                            (err) => {
                                                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error mov inventario (dev)" }); });
                                                next();
                                            }
                                        );
                                    });
                                } else {
                                    next();
                                }
                            };

                            // B. Descontar stock nuevo
                            const deductStock = () => {
                                if (newMedId) {
                                    connection.query('SELECT stock, descripcion FROM Inventario_Items WHERE id = ? AND id_clinica = ? FOR UPDATE', [newMedId, id_clinica], (err, stockRows) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error consultando nuevo stock" }); });
                                        if (stockRows.length === 0) return connection.rollback(() => { connection.release(); res.status(404).json({ error: 'Medicamento destino no encontrado' }); });

                                        const item = stockRows[0];
                                        if (item.stock < newCant) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(400).json({ error: `Stock insuficiente: ${item.descripcion}. Disp: ${item.stock}, Req: ${newCant}` });
                                            });
                                        }

                                        connection.query('UPDATE Inventario_Items SET stock = stock - ? WHERE id = ?', [newCant, newMedId], (err) => {
                                            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error descontando stock" }); });

                                            connection.query('INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                                                [id_clinica, usuario_editor, 'SALIDA', newCant, `Salida auto: Edición Tratamiento #${id}`, newMedId],
                                                (err) => {
                                                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error mov inventario (salida)" }); });
                                                    callback();
                                                }
                                            );
                                        });
                                    });
                                } else {
                                    callback();
                                }
                            };

                            returnStock(deductStock);
                        } else {
                            callback();
                        }
                    };

                    handleInventory(() => {
                        // 3. Construir Query Dinámica
                        const fields = [];
                        const values = [];

                        const add = (col, val) => { if (val !== undefined) { fields.push(`${col}=?`); values.push(val); } };

                        add('id_medicamento', id_medicamento);
                        add('dosis', dosis);
                        add('cantidad', cantidad);
                        add('instrucciones', instrucciones);
                        add('duracion_dias', duracion_dias);
                        add('notas', notas);
                        add('id_paciente', id_paciente);
                        add('prescripto_por', prescripto_por);

                        fields.push('editado = TRUE');

                        if (fields.length === 1) { // Solo 'editado=TRUE', no hubo cambios reales enviados
                            // Aun así permitimos hacer 'touch' o simplemente devolvemos éxito.
                        }

                        const sqlUpdate = `UPDATE Tratamientos SET ${fields.join(', ')} WHERE id = ?`;
                        values.push(id);

                        connection.query(sqlUpdate, values, (err) => {
                            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error actualizando tratamiento" }); });

                            // 4. Auditoría
                            let detalles = "Edición Tratamiento: ";
                            if (newMedId != oldMedId) detalles += `[Cambio Med] `;
                            if (newCant != oldCant) detalles += `[Cambio Cant: ${oldCant}->${newCant}] `;
                            if (id_paciente !== undefined) detalles += `[Cambio Paciente] `;

                            connection.query(
                                'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                                [
                                    usuario_editor,
                                    id_clinica,
                                    'EDITAR',
                                    'Tratamientos',
                                    id,
                                    detalles
                                ],
                                (err) => {
                                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error auditando" }); });

                                    connection.commit((err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error commit" }); });
                                        connection.release();
                                        res.json({ message: 'Tratamiento actualizado correctamente' });
                                    });
                                }
                            );
                        });
                    });
                }
            );
        });
    });
};
