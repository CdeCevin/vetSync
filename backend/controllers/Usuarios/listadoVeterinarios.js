const { queryConReintento } = require('../../db/queryHelper');

const listadoVeterinarios = async (req, res) => {
    try {
        const idClinica = req.clinicaId;

        // Solo obtenemos veterinarios (id_rol = 2) activos y datos NO sensibles
        const query = `
      SELECT id, nombre_completo, correo_electronico, id_rol 
      FROM Usuarios 
      WHERE id_clinica = ? AND id_rol = 2 AND activo = 1
      ORDER BY nombre_completo ASC
    `;

        const results = await queryConReintento(query, [idClinica]);

        res.json(results);
    } catch (error) {
        console.error('Error al obtener listado de veterinarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = listadoVeterinarios;
