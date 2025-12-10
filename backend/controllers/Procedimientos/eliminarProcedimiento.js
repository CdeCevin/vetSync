const pool = require('../../db/connection');

const eliminarProcedimiento = (req, res) => {
    const { id } = req.params;
    const usuario_editor = req.usuario.id;
    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: "Falta el ID del procedimiento" });
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

            // 1. Verificar existencia
            connection.query('SELECT * FROM Procedimientos WHERE id = ? AND id_clinica = ?', [id, id_clinica], (err, rows) => {
                if (err) {
                    return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error de base de datos" }); });
                }

                if (rows.length === 0) {
                    return connection.rollback(() => { connection.release(); res.status(404).json({ error: "Procedimiento no encontrado" }); });
                }

                // 2. Soft Delete
                connection.query('UPDATE Procedimientos SET estado = "Eliminado", activo = FALSE WHERE id = ?', [id], (err) => {
                    if (err) {
                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al eliminar procedimiento" }); });
                    }

                    // 3. Auditoría
                    connection.query(
                        'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            usuario_editor,
                            id_clinica,
                            'ELIMINAR',
                            'Procedimientos',
                            id,
                            `Procedimiento eliminado (soft delete)`
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
                                res.json({ message: "Procedimiento eliminado correctamente" });
                            });
                        }
                    );
                });
            });
        });
    });
};

module.exports = eliminarProcedimiento;
