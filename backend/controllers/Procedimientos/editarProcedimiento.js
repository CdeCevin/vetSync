const { queryConReintento } = require('../../db/queryHelper');
const pool = require('../../db/connection');

const editarProcedimiento = (req, res) => {
    const { id } = req.params;
    const usuario_editor = req.usuario.id;
    const {
        nombre_procedimiento,
        notas
    } = req.body;

    const id_clinica = req.clinicaId;

    if (!id || !nombre_procedimiento) {
        return res.status(400).json({ error: "Faltan datos obligatorios: nombre_procedimiento" });
    }

    // Usamos callbacks para consistencia con el patrón "stable"
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

            // 1. Verificar existencia y pertenencia
            connection.query('SELECT * FROM Procedimientos WHERE id = ? AND id_clinica = ?', [id, id_clinica], (err, rows) => {
                if (err) {
                    return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error de base de datos" }); });
                }

                if (rows.length === 0) {
                    return connection.rollback(() => { connection.release(); res.status(404).json({ error: "Procedimiento no encontrado" }); });
                }

                const procActual = rows[0];

                // 2. Actualizar
                connection.query(
                    'UPDATE Procedimientos SET nombre_procedimiento = ?, notas = ? WHERE id = ?',
                    [nombre_procedimiento, notas || '', id],
                    (err) => {
                        if (err) {
                            return connection.rollback(() => { connection.release(); res.status(500).json({ error: "Error al actualizar procedimiento" }); });
                        }

                        // 3. Auditoría
                        connection.query(
                            'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
                            [
                                usuario_editor,
                                id_clinica,
                                'EDITAR',
                                'Procedimientos',
                                id,
                                `Edición de procedimiento. Nombre anterior: ${procActual.nombre_procedimiento}`
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
                                    res.json({ message: "Procedimiento actualizado correctamente" });
                                });
                            }
                        );
                    }
                );
            });
        });
    });
};

module.exports = editarProcedimiento;
