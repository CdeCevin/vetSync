const { queryConReintento } = require('../db/queryHelper');

/**
 * Registra una acción en la tabla de auditoría.
 * @param {Object} params - Parámetros de la auditoría.
 * @param {number} params.id_usuario - ID del usuario que realiza la acción.
 * @param {number} params.id_clinica - ID de la clínica donde ocurre la acción.
 * @param {string} params.accion - Descripción breve de la acción (ej: 'CREAR', 'MODIFICAR').
 * @param {string} params.entidad - Entidad afectada (ej: 'Paciente', 'Cita').
 * @param {number} params.id_entidad - ID de la entidad afectada.
 * @param {string} params.detalles - Detalles adicionales (JSON string o texto plano).
 */
const logAuditoria = async ({ id_usuario, id_clinica, accion, entidad, id_entidad, detalles }) => {
    const query = `
    INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    try {
        await queryConReintento(query, [id_usuario, id_clinica, accion, entidad, id_entidad, detalles]);
    } catch (error) {
        console.error('Error registrando auditoría:', error);
        // No lanzamos error para no interrumpir el flujo principal si el log falla
    }
};

module.exports = logAuditoria;
