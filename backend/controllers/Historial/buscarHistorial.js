const { queryConReintento } = require('../../db/queryHelper');

const buscarHistorial = async (req, res) => {
    try {
        const idClinica = req.clinicaId;
        const filtro = req.query.q || ''; //
        let query = `
            SELECT 
                h.id,
                h.fecha_visita,
                h.diagnostico,
                h.notas,
                p.nombre AS paciente_nombre,
                p.especie AS paciente_especie,
                p.raza AS paciente_raza,
                p.id AS paciente_id,
                d.nombre AS dueno_nombre,
                u.nombre_completo AS veterinario_nombre,
                -- Agregamos listas concatenadas de procedimientos y tratamientos
                GROUP_CONCAT(DISTINCT 
                    CASE WHEN proc.estado != 'Eliminado' THEN proc.nombre_procedimiento ELSE NULL END
                SEPARATOR ', ') AS procedimientos_lista,
                GROUP_CONCAT(DISTINCT 
                    CASE WHEN t.estado != 'Cancelado' THEN ii.descripcion ELSE NULL END
                SEPARATOR ', ') AS tratamientos_lista
            FROM Historial_Medico h
            INNER JOIN Pacientes p ON h.id_paciente = p.id
            INNER JOIN Dueños d ON p.id_dueño = d.id
            LEFT JOIN Usuarios u ON h.id_usuario = u.id
            -- Joins para información extra
            LEFT JOIN Procedimientos proc ON h.id = proc.id_historial_medico
            LEFT JOIN Tratamientos t ON h.id = t.id_historial_medico
            LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id
            WHERE h.id_clinica = ? AND h.activo = 1
        `;

        const params = [idClinica];

        if (filtro.trim() !== '') {
            query += ` AND (
                p.nombre LIKE ? OR 
                d.nombre LIKE ? OR 
                u.nombre_completo LIKE ? OR
                h.diagnostico LIKE ? OR
                proc.nombre_procedimiento LIKE ?
            )`;
            const filtroLike = `%${filtro}%`;
            params.push(filtroLike, filtroLike, filtroLike, filtroLike, filtroLike);
        }

        // Agrupamos por ID de historial para que funcionen los GROUP_CONCAT
        query += ` GROUP BY h.id, h.fecha_visita, h.diagnostico, h.notas, p.nombre, p.especie, p.raza, p.id, d.nombre, u.nombre_completo`;

        query += ` ORDER BY h.fecha_visita DESC, h.id DESC LIMIT 50`;

        const results = await queryConReintento(query, params);

        // Formateo de respuesta
        const response = results.map(row => ({
            id: row.id,
            fecha: row.fecha_visita,
            diagnostico: row.diagnostico,
            paciente: {
                id: row.paciente_id,
                nombre: row.paciente_nombre,
                detalle: `${row.paciente_especie} ${row.paciente_raza ? '- ' + row.paciente_raza : ''}`
            },
            dueno: row.dueno_nombre,
            veterinario: row.veterinario_nombre || 'Desconocido',
            // Convertimos las listas (que pueden ser null) a arrays o strings limpios
            procedimientos: row.procedimientos_lista ? row.procedimientos_lista.split(', ') : [],
            tratamientos: row.tratamientos_lista ? row.tratamientos_lista.split(', ') : []
        }));

        res.json(response);

    } catch (error) {
        console.error('Error buscarHistorial:', error);
        res.status(500).json({ error: 'Error al buscar en el historial médico' });
    }
};

module.exports = buscarHistorial;
