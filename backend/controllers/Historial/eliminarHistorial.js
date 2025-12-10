const pool = require('../../db/connection');

const eliminarHistorial = (req, res) => {
    const { id } = req.params;
    const usuario_editor = req.usuario.id;
    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: "Falta el ID del historial" });
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
            connection.query('SELECT * FROM Historial_Medico WHERE id = ? AND id_clinica = ? AND activo = 1', [id, id_clinica], (err, rows) => {
                if (err) {
                    return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error base de datos" }); });
                }

                if (rows.length === 0) {
                    return connection.rollback(() => { connection.release(); res.status(404).json({ error: "Historial no encontrado" }); });
                }

                connection.query('UPDATE Historial_Medico SET activo = 0 WHERE id = ?', [id], (err) => {
                    if (err) {
                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al eliminar historial" }); });
                    }

                    // Cascade Soft Delete Tratamientos
                    // Marcamos como Cancelado y Inactivo
                    connection.query('UPDATE Tratamientos SET estado = "Cancelado", activo = 0 WHERE id_historial_medico = ?', [id], (err) => {
                        if (err) {
                            return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al eliminar tratamientos vinculados" }); });
                        }

                        //Cascade Soft Delete Procedimientos
                        connection.query('UPDATE Procedimientos SET estado = "Eliminado", activo = 0 WHERE id_historial_medico = ?', [id], (err) => {
                            if (err) {
                                return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al eliminar procedimientos vinculados" }); });
                            }

                            connection.query(
                                'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                                [
                                    usuario_editor,
                                    id_clinica,
                                    'ELIMINAR',
                                    'Historial_Medico',
                                    id,
                                    'Eliminación de historial y cascada a tratamientos/procedimientos'
                                ],
                                (err) => {
                                    if (err) {
                                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al auditar" }); });
                                    }

                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al commit" }); });
                                        }
                                        connection.release();
                                        res.json({ message: "Historial médico eliminado correctamente" });
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

module.exports = eliminarHistorial;
