const pool = require('../../db/connection');

const crearHistorial = (req, res) => {
    // User manual change kept
    const idUsuario = req.usuario.id;
    console.log('el id usuario es ', idUsuario);
    const idClinica = req.clinicaId;

    const {
        paciente_id,
        cita_id,
        diagnostico,
        notas_generales,
        procedimientos,
        tratamientos
    } = req.body;

    if (!paciente_id || !diagnostico) {
        return res.status(400).json({ error: "Faltan datos obligatorios: paciente_id, diagnostico" });
    }

    // Validación de Negocio
    const tieneNotas = notas_generales && notas_generales.trim().length > 0;
    const tieneProcedimientos = procedimientos && procedimientos.length > 0;
    const tieneTratamientos = tratamientos && tratamientos.length > 0;

    if (!tieneNotas && !tieneProcedimientos && !tieneTratamientos) {
        return res.status(400).json({
            error: "El historial debe contener al menos una resolución: Notas, Procedimientos o Tratamientos."
        });
    }

    // Transaction using Standard Callbacks (No Promises)
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error al obtener conexión del pool:", err);
            return res.status(500).json({ error: "Error de base de datos al iniciar transacción" });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error("Error al iniciar transacción:", err);
                return res.status(500).json({ error: "Error al iniciar consulta" });
            }

            // 1. Insertar Historial_Medico
            const queryHistorial = `INSERT INTO Historial_Medico (id_paciente, id_cita, id_usuario, fecha_visita, diagnostico, notas, id_clinica) 
                                    VALUES (?, ?, ?, NOW(), ?, ?, ?)`;
            const paramsHistorial = [paciente_id, cita_id || null, idUsuario, diagnostico, notas_generales || '', idClinica];

            connection.query(queryHistorial, paramsHistorial, (err, resultHistorial) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        console.error("Error al insertar Historial:", err);
                        res.status(500).json({ error: "Error al crear historial médico" });
                    });
                }

                const historialId = resultHistorial.insertId;

                // Function to handle next steps logically to avoid deep nesting
                const processCita = () => {
                    if (!cita_id) return processProcedimientos();

                    connection.query(`UPDATE Citas SET estado = 'Completada' WHERE id = ? AND id_clinica = ?`, [cita_id, idClinica], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error al actualizar Cita:", err);
                                res.status(500).json({ error: "Error al actualizar cita" });
                            });
                        }
                        processProcedimientos();
                    });
                };

                const processProcedimientos = () => {
                    if (!procedimientos || procedimientos.length === 0) return processTratamientos();

                    const procedimientosValues = procedimientos.map(p => [
                        historialId,
                        p.nombre,
                        new Date(),
                        p.notas || '',
                        idClinica
                    ]);

                    connection.query(`INSERT INTO Procedimientos (id_historial_medico, nombre_procedimiento, realizado_en, notas, id_clinica) VALUES ?`, [procedimientosValues], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error al insertar Procedimientos:", err);
                                res.status(500).json({ error: "Error al guardar procedimientos" });
                            });
                        }
                        processTratamientos();
                    });
                };

                const processTratamientos = () => {
                    if (!tratamientos || tratamientos.length === 0) return commitTransaction();

                    // Process treatments sequentially or via Promise.all? No promises allows.
                    // We must loop. Using a simple recursive function for async serial execution.
                    let i = 0;
                    const nextTratamiento = () => {
                        if (i >= tratamientos.length) return commitTransaction();

                        const t = tratamientos[i];
                        const queryTrat = `INSERT INTO Tratamientos 
                        (id_historial_medico, prescripto_por, id_clinica, fecha_prescripcion, dosis, instrucciones, duracion_dias, notas, id_medicamento)
                        VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`;

                        const paramsTrat = [historialId, idUsuario, idClinica, t.dosis, t.instrucciones, t.duracion_dias, t.notas || '', t.medicamento_id];

                        connection.query(queryTrat, paramsTrat, (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error("Error al insertar Tratamiento:", err);
                                    res.status(500).json({ error: "Error al guardar tratamiento" });
                                });
                            }

                            // Stock Update
                            if (t.medicamento_id && t.cantidad) {
                                connection.query(`UPDATE Inventario_Items SET stock = stock - ? WHERE id = ? AND id_clinica = ?`, [t.cantidad, t.medicamento_id, idClinica], (err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            console.error("Error al actualizar Stock:", err);
                                            res.status(500).json({ error: "Error al actualizar inventario" });
                                        });
                                    }
                                    i++;
                                    nextTratamiento();
                                });
                            } else {
                                i++;
                                nextTratamiento();
                            }
                        });
                    };
                    nextTratamiento();
                };

                const commitTransaction = () => {
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error("Error al hacer commit:", err);
                                res.status(500).json({ error: "Error al finalizar la transacción" });
                            });
                        }
                        connection.release();
                        res.status(201).json({
                            message: 'Historial médico creado exitosamente',
                            id: historialId
                        });
                    });
                };

                // Start chain
                processCita();
            });
        });
    });
};

module.exports = crearHistorial;
