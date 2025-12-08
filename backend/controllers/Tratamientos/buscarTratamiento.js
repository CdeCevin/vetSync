const { queryConReintento } = require('../../db/queryHelper');

const buscarTratamiento = async (req, res) => {
    try {
        const idClinica = req.clinicaId;
        // El frontend puede enviar ?q=paracetamol o ?q=firulais
        const filtro = req.query.q || '';

        // Base query: Joins con Pacientes, Médicos (Usuarios) e Inventario (Medicamentos)
        let query = `
            SELECT 
                t.id,
                t.id_paciente,
                p.nombre AS paciente_nombre,
                p.especie AS paciente_especie,
                p.raza AS paciente_raza,
                t.prescripto_por AS veterinario_id,
                u.nombre_completo AS veterinario_nombre,
                t.fecha_prescripcion,
                ii.descripcion AS medicamento,
                t.dosis,
                t.instrucciones,
                t.duracion_dias,
                t.notas,
                t.estado,
                t.activo
            FROM Tratamientos t
            INNER JOIN Pacientes p ON t.id_paciente = p.id
            LEFT JOIN Usuarios u ON t.prescripto_por = u.id
            LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id
            WHERE t.id_clinica = ? 
            -- Opcional: Filtrar solo activos/no cancelados si se desea
            -- AND t.estado != 'Cancelado' 
        `;

        const params = [idClinica];

        if (filtro.trim() !== '') {
            // Busqueda flexible: Nombre de paciente O Nombre de medicamento
            query += ` AND (
                p.nombre LIKE ? OR 
                ii.descripcion LIKE ? OR
                u.nombre_completo LIKE ?
            )`;
            const filtroLike = `%${filtro}%`;
            params.push(filtroLike, filtroLike, filtroLike);
        }

        query += ` ORDER BY t.fecha_prescripcion DESC LIMIT 50`; // Limit para evitar sobrecarga

        const results = await queryConReintento(query, params);

        // Formateo para el frontend
        const response = results.map(r => ({
            id: r.id,
            paciente: {
                id: r.id_paciente,
                nombre: r.paciente_nombre,
                detalle: `${r.paciente_especie} - ${r.paciente_raza || ''}`
            },
            medicamento: r.medicamento || 'Sin medicamento asignado',
            veterinario: r.veterinario_nombre || 'Desconocido',
            fecha: r.fecha_prescripcion,
            detalle: `Dosis: ${r.dosis}. ${r.instrucciones}`,
            estado: r.estado,
            activo: r.activo
        }));

        res.json(response);

    } catch (error) {
        console.error('Error en búsqueda de tratamientos:', error);
        res.status(500).json({ error: 'Error al buscar tratamientos' });
    }
};

module.exports = buscarTratamiento;
