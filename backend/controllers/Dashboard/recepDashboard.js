const { queryConReintento } = require('../../db/queryHelper');

const recepDashboard = async (req, res) => {
    const id_clinica = req.clinicaId;
    const stats = {};

    // 2. Definimos las 3 queries que necesitamos
    const queries = {

        // Query 1: Citas de Hoy (Total y Completadas)
        citasHoy: `
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas
            FROM Citas 
            WHERE id_clinica = ? AND activo = 1 AND DATE(fecha_cita) = CURDATE()
        `,

        // Query 2: Alertas de Stock (Productos por debajo del mínimo)
        alertasStock: `
            SELECT COUNT(*) AS total 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1 AND stock < stock_minimo
        `,

        // Query 3: Pacientes Recientes (Últimos 5 registros con datos del dueño)
        pacientesRecientes: `
            SELECT 
                P.nombre, 
                P.especie, 
                P.raza, 
                D.nombre AS dueno, 
                P.creado_en
            FROM Pacientes P
            LEFT JOIN Dueños D ON P.id_dueño = D.id
            WHERE P.id_clinica = ? AND P.activo = 1
            ORDER BY P.creado_en DESC
            LIMIT 5
        `
    };

    try {
        const citasHoyPromise = queryConReintento(queries.citasHoy, [id_clinica]);
        const alertasStockPromise = queryConReintento(queries.alertasStock, [id_clinica]);
        const pacientesRecientesPromise = queryConReintento(queries.pacientesRecientes, [id_clinica]);

        const [
            citasHoyResults,
            alertasStockResults,
            pacientesRecientesResults
        ] = await Promise.all([
            citasHoyPromise,
            alertasStockPromise,
            pacientesRecientesPromise
        ]);
        stats.citasHoy = {
            total: citasHoyResults[0].total || 0,
            completadas: citasHoyResults[0].completadas || 0
        };
        stats.alertasStock = alertasStockResults[0].total || 0;
        stats.pacientesRecientes = pacientesRecientesResults;

        res.json(stats);

    } catch (err) {
        console.error('Error al obtener datos del dashboard de recepción:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = recepDashboard;