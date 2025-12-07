const pool = require('../../db/connection');

exports.agregarTratamiento = (req, res) => {
    const {
        id_paciente,
        id_historial_medico,
        prescripto_por,
        fecha_prescripcion,
        id_medicamento,
        dosis,
        cantidad, // stock
        instrucciones,
        duracion_dias,
        notas
    } = req.body;

    const id_clinica = req.clinicaId;

    if (!id_paciente || !prescripto_por || !id_medicamento || !dosis || !cantidad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: id_paciente, prescripto_por, id_medicamento, dosis, cantidad.' });
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

            // 1. Verificar Stock
            connection.query(
                'SELECT id, descripcion, stock FROM Inventario_Items WHERE id = ? AND id_clinica = ? FOR UPDATE',
                [id_medicamento, id_clinica],
                (err, items) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error("Error consultando stock:", err);
                            res.status(500).json({ error: "Error al consultar inventario" });
                        });
                    }

                    if (items.length === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).json({ error: 'Medicamento no encontrado en el inventario.' });
                        });
                    }

                    const item = items[0];
                    if (item.stock < cantidad) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(400).json({
                                error: `Stock insuficiente para ${item.descripcion}. Disponible: ${item.stock}, Solicitado: ${cantidad}`
                            });
                        });
                    }

                    // 2. Insertar Tratamiento
                    const fecha = fecha_prescripcion || new Date();
                    const queryTratamiento = `
                        INSERT INTO Tratamientos 
                        (id_paciente, id_historial_medico, prescripto_por, id_clinica, fecha_prescripcion, dosis, cantidad, instrucciones, duracion_dias, notas, id_medicamento)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    connection.query(queryTratamiento, [
                        id_paciente,
                        id_historial_medico || null,
                        prescripto_por,
                        id_clinica,
                        fecha,
                        dosis,
                        cantidad,
                        instrucciones,
                        duracion_dias,
                        notas,
                        id_medicamento
                    ], (err, resultTratamiento) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error insertando tratamiento:", err);
                                res.status(500).json({ error: "Error al guardar tratamiento" });
                            });
                        }

                        const idTratamiento = resultTratamiento.insertId;

                        // 3. Actualizar Inventario
                        connection.query(
                            'UPDATE Inventario_Items SET stock = stock - ? WHERE id = ?',
                            [cantidad, id_medicamento],
                            (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        console.error("Error actualizando stock:", err);
                                        res.status(500).json({ error: "Error al descontar stock" });
                                    });
                                }

                                // 4. Movimiento
                                connection.query(
                                    'INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
                                    [id_clinica, prescripto_por, 'SALIDA', cantidad, `Tratamiento #${idTratamiento} - Paciente #${id_paciente}`, id_medicamento],
                                    (err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                console.error("Error movimiento inventario:", err);
                                                res.status(500).json({ error: "Error al registrar movimiento" });
                                            });
                                        }

                                        // 5. Auditoria
                                        connection.query(
                                            'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                                            [prescripto_por, id_clinica, 'CREAR', 'Tratamientos', idTratamiento, `Tratamiento creado para paciente ${id_paciente}. Medicamento: ${item.descripcion}, Cantidad: ${cantidad}`],
                                            (err) => {
                                                if (err) {
                                                    // Non-critical, but implies transaction fail
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        res.status(500).json({ error: "Error al auditar" });
                                                    });
                                                }

                                                connection.commit((err) => {
                                                    if (err) {
                                                        return connection.rollback(() => {
                                                            connection.release();
                                                            res.status(500).json({ error: "Error al finalizar transacción" });
                                                        });
                                                    }
                                                    connection.release();
                                                    res.status(201).json({
                                                        message: 'Tratamiento agregado correctamente',
                                                        id: idTratamiento
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    });
                }
            );
        });
    });
};
