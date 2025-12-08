const pool = require('../../db/connection');

const editarHistorial = (req, res) => {
    const { id } = req.params;
    const usuario_editor = req.usuario.id;

    const {
        diagnostico,
        notas,
        id_paciente,
        id_usuario,
        id_cita,
        fecha_visita,
    } = req.body;

    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: "Falta el ID del historial" });
    }

    // Dynamic filtering of fields
    const fieldsToUpdate = [];
    const values = [];

    // Helper para añadir campos si existen
    const addField = (field, value) => {
        if (value !== undefined) {
            fieldsToUpdate.push(`${field} = ?`);
            values.push(value);
        }
    };

    addField("diagnostico", diagnostico);
    addField("notas", notas);
    addField("id_paciente", id_paciente);
    addField("id_usuario", id_usuario);
    addField("id_cita", id_cita);
    addField("fecha_visita", fecha_visita);

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: "No se enviaron campos para actualizar." });
    }

    // Add ID and Clinic to standard values array for the WHERE clause
    values.push(id);
    values.push(id_clinica);

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

            // 1. Validaciones Previa (Si hay cambios de FK)
            const validateForeignKeys = (next) => {
                let pendingValidations = 0;
                let errorFound = null;

                const checkDone = () => {
                    if (errorFound) return; // Already failed
                    if (pendingValidations === 0) next();
                };

                // Validate Patient
                if (id_paciente !== undefined) {
                    pendingValidations++;
                    connection.query('SELECT id FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = 1', [id_paciente, id_clinica], (err, rows) => {
                        if (errorFound) return;
                        if (err) { errorFound = err; return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error validando paciente" }); }); }
                        if (rows.length === 0) { errorFound = true; return connection.rollback(() => { connection.release(); res.status(400).json({ error: "Paciente destino no existe o no es válido" }); }); }
                        pendingValidations--;
                        checkDone();
                    });
                }

                // Validate User
                if (id_usuario !== undefined) {
                    pendingValidations++;
                    connection.query('SELECT id FROM Usuarios WHERE id = ? AND id_clinica = ?', [id_usuario, id_clinica], (err, rows) => {
                        if (errorFound) return;
                        if (err) { errorFound = err; return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error validando usuario" }); }); }
                        if (rows.length === 0) { errorFound = true; return connection.rollback(() => { connection.release(); res.status(400).json({ error: "Usuario destino no existe" }); }); }
                        pendingValidations--;
                        checkDone();
                    });
                }

                if (pendingValidations === 0) next();
            };


            validateForeignKeys(() => {
                // 2. Verificar existencia del Historial
                connection.query('SELECT * FROM Historial_Medico WHERE id = ? AND id_clinica = ? AND activo = 1', [id, id_clinica], (err, rows) => {
                    if (err) {
                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error base de datos" }); });
                    }

                    if (rows.length === 0) {
                        return connection.rollback(() => { connection.release(); res.status(404).json({ error: "Historial no encontrado" }); });
                    }

                    const historialActual = rows[0];

                    // 3. Ejecutar Update del Historial
                    const querySql = `UPDATE Historial_Medico SET ${fieldsToUpdate.join(", ")} WHERE id = ? AND id_clinica = ?`;
                    connection.query(querySql, values, (err) => {
                        if (err) {
                            return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al actualizar historial" }); });
                        }

                        // 4. Cascade Update Logic (If patient changed)
                        const handleCascade = (done) => {
                            if (id_paciente !== undefined && id_paciente != historialActual.id_paciente) {
                                // Cascade to Tratamientos
                                connection.query('UPDATE Tratamientos SET id_paciente = ? WHERE id_historial_medico = ?', [id_paciente, id], (err) => {
                                    if (err) return connection.rollback(() => {
                                        console.error("Cascade Tratamientos failed:", err);
                                        connection.release(); res.status(500).json({ error: "Error cascada tratamientos" });
                                    });
                                    done();
                                });
                            } else {
                                done();
                            }
                        };

                        handleCascade(() => {
                            // 5. Auditoría
                            let detallesCambio = "Edición Completa: ";
                            if (diagnostico !== undefined) detallesCambio += `[Diagnóstico] `;
                            if (notas !== undefined) detallesCambio += `[Notas] `;
                            if (fecha_visita !== undefined) detallesCambio += `[Fecha: ${fecha_visita}] `;
                            if (id_paciente !== undefined) detallesCambio += `[Reasignación Paciente: ${historialActual.id_paciente} -> ${id_paciente}] `;
                            if (id_usuario !== undefined) detallesCambio += `[Reasignación Usuario: ${historialActual.id_usuario} -> ${id_usuario}] `;

                            connection.query(
                                'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                                [
                                    usuario_editor,
                                    id_clinica,
                                    'EDITAR',
                                    'Historial_Medico',
                                    id,
                                    detallesCambio
                                ],
                                (err) => {
                                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al auditar" }); });

                                    connection.commit((err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al commit" }); });
                                        connection.release();
                                        res.json({ message: "Historial actualizado correctamente" });
                                    });
                                }
                            );
                        });
                    });
                });
            });
        });
    });
};

module.exports = editarHistorial;
