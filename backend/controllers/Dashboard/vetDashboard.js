const { queryConReintento } = require('../../db/queryHelper');

const vetDashboard = async (req, res) => {
    const id_clinica = req.clinicaId;
    const id_usuario = req.usuario.id; // ID del veterinario logueado
    const stats = {};

    // 2. Definimos las 4 queries
    const queries = {

        // Query 1: Citas del Veterinario para Hoy
        citasHoy: `
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas
            FROM Citas 
            WHERE id_clinica = ? AND id_usuario = ? AND activo = 1 AND DATE(fecha_cita) = CURDATE()
        `,

        // Query 2: Total de Pacientes en la Clínica (Activos)
        totalPacientes: `
            SELECT COUNT(*) AS total 
            FROM Pacientes 
            WHERE id_clinica = ? AND activo = 1
        `,

        // Query 3: Stock Crítico (Reutilizamos lógica de admin/recep)
        stockCritico: `
            SELECT COUNT(*) AS total 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1 AND stock < stock_minimo
        `,

        // Query 4: Próximas Citas del Veterinario
        proximasCitas: `
            SELECT 
                C.fecha_cita, 
                P.nombre AS paciente, 
                D.nombre AS dueno, 
                C.estado 
            FROM Citas C
            INNER JOIN Pacientes P ON C.id_paciente = P.id
            INNER JOIN Dueños D ON P.id_dueño = D.id
            WHERE C.id_clinica = ? AND C.id_usuario = ? AND C.activo = 1 
                AND C.fecha_cita >= NOW()
            ORDER BY C.fecha_cita ASC
            LIMIT 5
        `
    };

    try {

        const citasHoyResults = await queryConReintento(queries.citasHoy, [id_clinica, id_usuario]);
        stats.citasHoy = {
            total: citasHoyResults[0].total || 0,
            pendientes: citasHoyResults[0].pendientes || 0,
            completadas: citasHoyResults[0].completadas || 0
        };

        const totalPacientesResults = await queryConReintento(queries.totalPacientes, [id_clinica]);
        stats.totalPacientes = totalPacientesResults[0].total || 0;

        const stockCriticoResults = await queryConReintento(queries.stockCritico, [id_clinica]);
        stats.stockCritico = stockCriticoResults[0].total || 0;

        const proximasCitasResults = await queryConReintento(queries.proximasCitas, [id_clinica, id_usuario]);
        stats.proximasCitas = proximasCitasResults;

        // 5. Enviamos respuesta
        res.json(stats);

    } catch (err) {
        console.error('Error al obtener datos del dashboard veterinario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = vetDashboard;
