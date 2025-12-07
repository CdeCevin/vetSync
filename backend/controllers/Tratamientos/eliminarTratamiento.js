const pool = require('../../db/connection');

exports.eliminarTratamiento = (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;
    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del tratamiento' });
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.error("Error conexión:", err);
            return res.status(500).json({ error: "Error de conexión" });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: "Error iniciando transacción" });
            }

            // Verificar existencia
            connection.query('SELECT * FROM Tratamientos WHERE id = ? AND id_clinica = ?', [id, id_clinica], (err, rows) => {
                if (err) {
                    return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error base de datos" }); });
                }

                if (rows.length === 0) {
                    return connection.rollback(() => { connection.release(); res.status(404).json({ error: 'Tratamiento no encontrado' }); });
                }

                connection.query('UPDATE Tratamientos SET estado = "Cancelado" WHERE id = ?', [id], (err) => {
                    if (err) {
                        return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al cancelar" }); });
                    }

                    // Auditoría
                    connection.query(
                        'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            id_usuario || rows[0].prescripto_por,
                            id_clinica,
                            'CANCELAR',
                            'Tratamientos',
                            id,
                            'Tratamiento marcado como Cancelado'
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
                                res.json({ message: 'Tratamiento desactivado/cancelado correctamente' });
                            });
                        }
                    );
                });
            });
        });
    });
};
