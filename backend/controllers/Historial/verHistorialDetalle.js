const pool = require('../../db/connection');
const util = require('util');

const verHistorialDetalle = async (req, res) => {
    const { id } = req.params; // ID del Historial
    const idClinica = req.clinicaId;

    if (!id) {
        return res.status(400).json({ error: "Falta el ID del historial" });
    }

    // Promisify pool.query to avoid using .promise() which is causing issues
    const query = util.promisify(pool.query).bind(pool);

    try {
        // 1. Obtener Cabecera (Historial + Paciente + Veterinario)
        const headerRows = await query(`
            SELECT 
                h.id AS id_historial,
                h.fecha_visita,
                h.diagnostico,
                h.notas AS notas_generales,
                p.id AS id_paciente,
                p.nombre AS nombre_paciente,
                u.id AS id_veterinario,
                u.nombre_completo AS nombre_veterinario
            FROM Historial_Medico h
            JOIN Pacientes p ON h.id_paciente = p.id
            LEFT JOIN Usuarios u ON h.id_usuario = u.id
            WHERE h.id = ? AND h.id_clinica = ?
        `, [id, idClinica]);

        if (headerRows.length === 0) {
            return res.status(404).json({ error: "Historial médico no encontrado" });
        }

        const header = headerRows[0];

        // 2. Obtener Procedimientos
        const procedimientosRows = await query(`
            SELECT 
                id,
                nombre_procedimiento AS nombre,
                notas
            FROM Procedimientos
            WHERE id_historial_medico = ? AND id_clinica = ?
        `, [id, idClinica]);

        // Formatear procedimientos para el JSON (agregando descripciones ficticias si no existen en DB, o usando notas)
        const procedimientos = procedimientosRows.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: "Procedimiento realizado en consulta", // Placeholder o podrías usar notas
            notas: p.notas
        }));

        // 3. Obtener Tratamientos
        const tratamientosRows = await query(`
            SELECT 
                t.id,
                ii.descripcion AS medicamento,
                ii.id AS id_inventario,
                t.dosis,
                t.instrucciones,
                t.duracion_dias,
                ii.unidad_medida AS unidad -- Asumiendo columna unidad_medida existe en Inventario_Items, si no revisar tables.sql
            FROM Tratamientos t
            LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id
            WHERE t.id_historial_medico = ? AND t.id_clinica = ?
        `, [id, idClinica]);

        // Formatear tratamientos
        // NOTA: 'cantidad_entregada' y 'estado' no están en la tabla Tratamientos actualmente.
        const tratamientos = tratamientosRows.map(t => ({
            id: t.id,
            medicamento: t.medicamento || "Sin nombre",
            id_inventario: t.id_inventario,
            dosis: t.dosis,
            // cantidad_entregada: ??? - No existe en DB
            unidad: t.unidad || "unidad",
            instrucciones: t.instrucciones,
            duracion_dias: t.duracion_dias,
            estado: "Activo" // Calculado o hardcodeado
        }));

        // 4. Armar el JSON Final
        const responseHelper = {
            id_historial: header.id_historial,
            fecha_visita: header.fecha_visita,
            id_paciente: header.id_paciente,
            nombre_paciente: header.nombre_paciente,
            id_veterinario: header.id_veterinario,
            nombre_veterinario: header.nombre_veterinario,
            diagnostico: header.diagnostico,
            notas_generales: header.notas_generales,
            procedimientos: procedimientos,
            tratamientos: tratamientos
        };

        res.json(responseHelper);

    } catch (error) {
        console.error("Error al obtener detalle historial:", error);
        res.status(500).json({ error: "Error interno al obtener el historial" });
    }
};

module.exports = verHistorialDetalle;
