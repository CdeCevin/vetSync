const pool = require('../../db/connection');

exports.editarTratamiento = (req, res) => {
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

            // 1. Obtener tratamiento actual
            connection.query(
                'SELECT * FROM Tratamientos WHERE id = ? AND id_clinica = ? FOR UPDATE',
                [id, id_clinica],
                (err, rows) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error consultando tratamiento:", err);
                            res.status(500).json({ error: "Error al consultar tratamiento" });
                        });
                    }

                    if (rows.length === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).json({ error: 'Tratamiento no encontrado o no pertenece a esta clínica' });
                        });
                    }

                    const tratamientoActual = rows[0];
                    const oldMedId = tratamientoActual.id_medicamento;
                    const oldCant = tratamientoActual.cantidad;
                    const newMedId = id_medicamento;
                    const newCant = cantidad;

                    // Función para manejar el update de inventario secuencialmente
                    const handleInventory = (callback) => {
                        if (oldMedId != newMedId || oldCant != newCant) {
                            // A. Devolver stock anterior
                            const returnStock = (next) => {
                                if (oldMedId) {
                                    connection.query('UPDATE Inventario_Items SET stock = stock + ? WHERE id = ?', [oldCant, oldMedId], (err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error devolviendo stock" }); });

                                        connection.query('INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                                            [id_clinica, usuario_editor || tratamientoActual.prescripto_por, 'ENTRADA', oldCant, `Devolución por edición de Tratamiento #${id}`, oldMedId],
                                            (err) => {
                                                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error registrando devolución" }); });
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
                                connection.query('SELECT stock, descripcion FROM Inventario_Items WHERE id = ? AND id_clinica = ? FOR UPDATE', [newMedId, id_clinica], (err, stockRows) => {
                                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error consultando nuevo stock" }); });

                                    if (stockRows.length === 0) return connection.rollback(() => { connection.release(); res.status(404).json({ error: 'Nuevo medicamento no encontrado' }); });

                                    const nuevoStock = stockRows[0].stock; // Usando .stock
                                    if (nuevoStock < newCant) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            res.status(400).json({ error: `Stock insuficiente para ${stockRows[0].descripcion}. Disponible: ${nuevoStock}, Solicitado: ${newCant}` });
                                        });
                                    }

                                    connection.query('UPDATE Inventario_Items SET stock = stock - ? WHERE id = ?', [newCant, newMedId], (err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error descontando stock" }); });

                                        connection.query('INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                                            [id_clinica, usuario_editor || tratamientoActual.prescripto_por, 'SALIDA', newCant, `Ajuste por edición de Tratamiento #${id}`, newMedId],
                                            (err) => {
                                                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error registrando salida" }); });
                                                callback();
                                            }
                                        );
                                    });
                                });
                            };

                            returnStock(deductStock);
                        } else {
                            callback();
                        }
                    };

                    handleInventory(() => {
                        // 2. Actualizar Tratamiento
                        const queryUpdate = `
                            UPDATE Tratamientos 
                            SET id_medicamento=?, dosis=?, cantidad=?, instrucciones=?, duracion_dias=?, notas=?, editado=TRUE
                            WHERE id=?
                        `;
                        connection.query(queryUpdate, [newMedId, dosis, newCant, instrucciones, duracion_dias, notas, id], (err) => {
                            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error actualizando tratamiento" }); });

                            // 3. Auditoría
                            connection.query(
                                'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                                [
                                    usuario_editor || tratamientoActual.prescripto_por,
                                    id_clinica,
                                    'EDITAR',
                                    'Tratamientos',
                                    id,
                                    `Edición de tratamiento. Cambios en medicamento/cantidad: ${oldMedId != newMedId || oldCant != newCant}`
                                ],
                                (err) => {
                                    if (err) { /* Log error but don't fail transaction? better safe rollback */
                                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error auditando" }); });
                                    }

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
