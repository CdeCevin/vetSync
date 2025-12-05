/**
 * Compara dos objetos y retorna las diferencias.
 * @param {Object} original - Objeto con valores actuales en DB.
 * @param {Object} updates - Objeto con los nuevos valores propuestos.
 * @returns {Object|null} - Objeto con los cambios { campo: { anterior, nuevo } } o null si no hay cambios.
 */
const getDiff = (original, updates) => {
    const changes = {};
    for (const key in updates) {
        // Ignoramos undefined, pero aceptamos null
        if (updates[key] === undefined) continue;

        // Comparación flexible (loose equality) para manejar casos como 10 vs "10"
        // Si ambos son null/undefined, son iguales.
        if (updates[key] != original[key]) {
            changes[key] = {
                anterior: original[key],
                nuevo: updates[key]
            };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
};

module.exports = getDiff;
