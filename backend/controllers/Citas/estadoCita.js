// Archivo: controllers/Citas/estadoCita.js

const connection = require('../../db/connection'); // Asegúrate que la ruta a tu conexión sea correcta
const util = require('util');

// Convertimos connection.query en una función que devuelve promesas
const query = util.promisify(connection.query).bind(connection);

const estadoCita = async (req, res) => {
    
    // 1. Obtenemos los datos necesarios
    const { id } = req.params;             // El ID de la cita desde la URL
    const { estado } = req.body;           // El nuevo estado desde el JSON: { "estado": "completada" }
    const idClinica = req.clinicaId;     // El ID de la clínica (desde tu middleware verifyToken)


    if (!estado) {
        return res.status(400).json({ error: 'El campo "estado" es requerido en el body.' });
    }

    try {

        const selectQuery = 'SELECT id FROM Citas WHERE id = ? AND id_clinica = ? AND activo = TRUE';
        const results = await query(selectQuery, [id, idClinica]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada o no pertenece a esta clínica' });
        }
        const updateQuery = 'UPDATE Citas SET estado = ? WHERE id = ? AND id_clinica = ?';
        
        await query(updateQuery, [estado, id, idClinica]);

        res.json({ message: 'Estado de la cita actualizado correctamente' });

    } catch (err) {
        console.error('Error actualizando estado de la Cita:', err);
        res.status(500).json({ error: 'Error interno del servidor al actualizar la cita' });
    }
};

module.exports = estadoCita;