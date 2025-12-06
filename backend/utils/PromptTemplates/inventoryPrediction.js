/**
 * Generates the prompt for the Gemini model to analyze inventory data.
 * @param {Array} inventoryData - Array of objects containing product info and movement history.
 * @returns {String} The formatted prompt.
 */
const generateInventoryPrompt = (inventoryData) => {
    return `
    Eres un experto en gestión de inventarios y logística veterinaria.
    Analiza los siguientes datos de inventario y consumo histórico para predecir el agotamiento de stock y sugerir reposición.
    
    Datos del Inventario:
    ${JSON.stringify(inventoryData, null, 2)}

    Instrucciones:
    1. Para cada producto, calcula el consumo promedio diario basado en el historial de movimientos (tipo 'salida').
    2. Estima cuántos días durará el stock actual.
    3. Identifica productos críticos (baja duración estimada).
    4. Sugiere una cantidad de reposición para cubrir al menos 30 días de inventario.
    
    Formato de Respuesta (EXCLUSIVAMENTE JSON):
    Devuelve un arreglo de objetos JSON con la siguiente estructura, sin texto adicional ni markdown:
    [
      {
        "id": "id_del_producto",
        "nombre": "nombre_del_producto",
        "dias_restantes_estimados": numero,
        "nivel_riesgo": "Alto" | "Medio" | "Bajo",
        "cantidad_sugerida_reposicion": numero,
        "justificacion": "Breve explicación del análisis"
      }
    ]
  `;
};

module.exports = { generateInventoryPrompt };
