const db = require('../../db/connection');

exports.eliminarTratamiento = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;
    const id_clinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: 'Falta el ID del tratamiento' });
    }

    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // Verificar existencia
        const [rows] = await connection.query(
            'SELECT * FROM Tratamientos WHERE id = ? AND id_clinica = ?',
            [id, id_clinica]
        );

        if (rows.length === 0) {
            throw new Error('Tratamiento no encontrado');
        }

        await connection.query(
            'UPDATE Tratamientos SET estado = "Cancelado" WHERE id = ?',
            [id]
        );

        // Auditoría
        await connection.query(
            'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
            [
                id_usuario || rows[0].prescripto_por,
                id_clinica,
                'CANCELAR',
                'Tratamientos',
                id,
                'Tratamiento marcado como Cancelado'
            ]
        );

        await connection.commit();
        res.json({ message: 'Tratamiento desactivado/cancelado correctamente' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al desactivar tratamiento:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
