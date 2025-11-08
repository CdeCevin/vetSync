const connection = require('../../db/connection');
const util = require('util');

// 1. Convertimos 'connection.query' a promesas
const query = util.promisify(connection.query).bind(connection);

const adminDashboard = async (req, res) => {
    const id_clinica = req.clinicaId;
    const stats = {};

    // 2. Definimos las 3 queries que necesitamos
    const queries = {
        
        // Query 1: Cantidad de Usuarios (Corregida a 'activo = 1' como pusiste)
        totalUsuarios: 'SELECT COUNT(*) AS total FROM Usuarios WHERE activo = 1 AND id_clinica = ?',
        
        // Query 2: Últimos 5 cambios (Corregido el 'id_clinica = 1' hardcodeado)
        // Selecciono columnas específicas en lugar de '*' para ser más eficiente
        ultimosCambios: `
            SELECT COUNT(*) AS total 
            FROM Registros_Auditoria 
            WHERE id_clinica = ? AND creado_en >= NOW() - INTERVAL 7 DAY
        `,
        
        // Query 3: Actividad reciente (¡NUEVA QUERY!)
        // Esta une Registros, Usuarios y Roles, y calcula el tiempo transcurrido.
        actividadReciente: `
            SELECT
                RA.accion,
                RA.entidad,
                RA.detalles,
                U.nombre_completo,
                R.nombre AS nombre_rol,
                RA.creado_en,
                CASE
                    WHEN TIMESTAMPDIFF(MINUTE, RA.creado_en, NOW()) < 1 THEN 'hace segundos'
                    WHEN TIMESTAMPDIFF(MINUTE, RA.creado_en, NOW()) < 60 THEN CONCAT('hace ', TIMESTAMPDIFF(MINUTE, RA.creado_en, NOW()), ' min')
                    WHEN TIMESTAMPDIFF(HOUR, RA.creado_en, NOW()) < 24 THEN CONCAT('hace ', TIMESTAMPDIFF(HOUR, RA.creado_en, NOW()), ' h')
                    ELSE CONCAT('hace ', TIMESTAMPDIFF(DAY, RA.creado_en, NOW()), ' d')
                END AS tiempo_transcurrido
            FROM Registros_Auditoria AS RA
            LEFT JOIN Usuarios AS U ON RA.id_usuario = U.id
            LEFT JOIN Roles AS R ON U.id_rol = R.id
            WHERE RA.id_clinica = ?
            ORDER BY RA.creado_en DESC
            LIMIT 10
        `
        // Usamos LEFT JOIN por si un usuario es eliminado, que el log igual aparezca.
    };

    // 3. Usamos un bloque try...catch para manejar errores
    try {
        // 4. Preparamos todas las promesas de consulta.
        //    (Todas usan [id_clinica] como parámetro)
        const totalUsuariosPromise = query(queries.totalUsuarios, [id_clinica]);
        const ultimosCambiosPromise = query(queries.ultimosCambios, [id_clinica]);
        const actividadRecientePromise = query(queries.actividadReciente, [id_clinica]);

        // 5. Con Promise.all(), ejecutamos TODAS en paralelo
        const [
            totalUsuariosResults,
            ultimosCambiosResults,
            actividadRecienteResults
        ] = await Promise.all([
            totalUsuariosPromise,
            ultimosCambiosPromise,
            actividadRecientePromise
        ]);

        // 6. Asignamos los resultados. 
        stats.totalUsuarios = totalUsuariosResults[0].total;
        stats.ultimosCambios = ultimosCambiosResults[0].total;
        stats.actividadReciente = actividadRecienteResults;

        // 7. Enviamos la respuesta JSON
        res.json(stats);

    } catch (err) {
        // Si CUALQUIERA de las 3 consultas falla, el catch lo atrapará
        console.error('Error al obtener datos del dashboard:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = adminDashboard;