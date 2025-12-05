const { queryConReintento } = require('../../db/queryHelper');

const verLogs = async (req, res) => {
    try {
        const idClinica = req.clinicaId; // Middleware lo pone aquí
        const { id_usuario, fechaInicio, fechaFin, accion, limite } = req.query;

        let query = `
      SELECT 
        l.id,
        l.accion,
        l.entidad,
        l.id_entidad,
        l.detalles,
        l.creado_en as fecha,
        u.nombre_completo as usuario,
        u.correo_electronico,
        r.nombre as rol
      FROM Registros_Auditoria l
      LEFT JOIN Usuarios u ON l.id_usuario = u.id
      LEFT JOIN Roles r ON u.id_rol = r.id
      WHERE l.id_clinica = ?
    `;

        const params = [idClinica];

        // Filtros dinámicos
        if (id_usuario) {
            query += ' AND l.id_usuario = ?';
            params.push(id_usuario);
        }
        if (fechaInicio) {
            query += ' AND l.creado_en >= ?';
            params.push(`${fechaInicio} 00:00:00`);
        }
        if (fechaFin) {
            query += ' AND l.creado_en <= ?';
            params.push(`${fechaFin} 23:59:59`);
        }
        if (accion) {
            query += ' AND l.accion = ?';
            params.push(accion);
        }

        query += ' ORDER BY l.id DESC';

        // Límite por defecto para no saturar si hay millones
        const limit = limite ? parseInt(limite) : 100;
        query += ' LIMIT ?';
        params.push(limit);

        const results = await queryConReintento(query, params);

        res.json(results);

    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({ error: 'Error al obtener registros de auditoría' });
    }
};

module.exports = verLogs;
