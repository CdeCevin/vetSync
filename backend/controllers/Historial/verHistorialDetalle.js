const { queryConReintento } = require('../../db/queryHelper');

// Ahora este controlador devuelve el LISTADO completo (últimos 50)
const verHistorialDetalle = async (req, res) => {
    const idClinica = req.clinicaId;

    try {
        // 1. Obtener los Historiales (Cabeceras)
        const queryHeader = `
            SELECT 
                h.id,
                h.fecha_visita,
                h.diagnostico,
                h.notas AS notas_generales, 
                h.id_cita,
                p.nombre AS paciente_nombre,
                p.especie AS paciente_especie,
                p.raza AS paciente_raza,
                p.id AS paciente_id,
                u.nombre_completo AS veterinario_nombre,
                u.id AS veterinario_id
            FROM Historial_Medico h
            JOIN Pacientes p ON h.id_paciente = p.id
            LEFT JOIN Usuarios u ON h.id_usuario = u.id
            WHERE h.id_clinica = ? AND h.activo = 1
            ORDER BY h.fecha_visita DESC, h.id DESC
            LIMIT 50
        `;

        const historiales = await queryConReintento(queryHeader, [idClinica]);

        if (historiales.length === 0) {
            return res.json([]);
        }

        // 2. Obtener IDs para buscar detalles en lote (Bulk Fetch)
        const historialIds = historiales.map(h => h.id);

        if (historialIds.length > 0) {
            // 3. Obtener Procedimientos
            const queryProc = `
                SELECT * 
                FROM Procedimientos 
                WHERE id_historial_medico IN (?) AND id_clinica = ? AND estado != 'Eliminado'
            `;
            const procedimientos = await queryConReintento(queryProc, [historialIds, idClinica]);

            // 4. Obtener Tratamientos
            const queryTrat = `
                SELECT 
                    t.*,
                    ii.descripcion AS medicamento_nombre
                FROM Tratamientos t
                LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id
                WHERE t.id_historial_medico IN (?) AND t.id_clinica = ? AND t.estado != 'Cancelado'
            `;
            const tratamientos = await queryConReintento(queryTrat, [historialIds, idClinica]);

            // 5. Unir datos (Merge) en Javascript
            // Creamos mapas para acceso rápido
            const procMap = {};
            const tratMap = {};

            procedimientos.forEach(p => {
                if (!procMap[p.id_historial_medico]) procMap[p.id_historial_medico] = [];
                procMap[p.id_historial_medico].push(p);
            });

            tratamientos.forEach(t => {
                if (!tratMap[t.id_historial_medico]) tratMap[t.id_historial_medico] = [];
                tratMap[t.id_historial_medico].push(t);
            });

            // Asignar a cada historial
            const resultadoFinal = historiales.map(h => ({
                ...h,
                procedimientos: procMap[h.id] || [],
                tratamientos: tratMap[h.id] || []
            }));

            res.json(resultadoFinal);
        } else {
            res.json(historiales);
        }

    } catch (error) {
        console.error("Error al ver historial:", error);
        res.status(500).json({ error: "Error al obtener el historial médico" });
    }
};

module.exports = verHistorialDetalle;
