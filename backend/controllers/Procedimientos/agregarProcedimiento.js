const pool = require('../../db/connection');
const util = require('util');

const agregarProcedimiento = async (req, res) => {
    const {
        id_historial_medico,
        nombre_procedimiento,
        notas
    } = req.body;

    const idClinica = req.clinicaId;

    if (!id_historial_medico || !nombre_procedimiento) {
        return res.status(400).json({ error: "Faltan datos: id_historial_medico y nombre_procedimiento son obligatorios" });
    }

    const query = util.promisify(pool.query).bind(pool);

    try {
        // Verificar que el historial exista y pertenezca a la clínica (seguridad)
        const historialCheck = await query(
            'SELECT id FROM Historial_Medico WHERE id = ? AND id_clinica = ?',
            [id_historial_medico, idClinica]
        );

        if (historialCheck.length === 0) {
            return res.status(404).json({ error: "El historial médico indicado no existe o no pertenece a esta clínica." });
        }

        // Insertar procedimiento
        const result = await query(
            `INSERT INTO Procedimientos 
            (id_historial_medico, nombre_procedimiento, realizado_en, notas, id_clinica)
            VALUES (?, ?, NOW(), ?, ?)`,
            [id_historial_medico, nombre_procedimiento, notas || '', idClinica]
        );

        res.status(201).json({
            message: "Procedimiento agregado correctamente",
            id: result.insertId,
            id_historial_medico
        });

    } catch (error) {
        console.error("Error al agregar procedimiento:", error);
        res.status(500).json({ error: "Error interno al guardar el procedimiento" });
    }
};

module.exports = agregarProcedimiento;
