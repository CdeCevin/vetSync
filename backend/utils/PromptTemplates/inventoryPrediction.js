/**
 * Generates the prompt for the Gemini model to analyze inventory data.
 * @param {Array} inventoryData - Array of objects containing product info and movement history.
 * @returns {String} The formatted prompt.
 */
const generateInventoryPrompt = (inventoryData) => {
  return `
    Eres un asistente experto en logística veterinaria (VetSync AI).
    Tu objetivo es analizar el inventario para prevenir quiebres de stock y detectar productos estancados.
    
    Datos del Inventario (formato JSON):
    ${JSON.stringify(inventoryData)}

    INSTRUCCIONES DE ANÁLISIS:
    1. Calcula la velocidad de consumo diario (promedio) de los últimos 90 días para cada ítem.
    2. Estima los "Días de Cobertura" (Stock Actual / Consumo Diario).
    3. Si el Consumo Diario es 0, marca los días como 999 (Stock Estancado).
    4. Sugiere reposición para alcanzar 30 días de cobertura + el Stock Mínimo.

    FORMATO DE RESPUESTA (JSON PURO):
    Devuelve UN ÚNICO objeto JSON (no un array, no markdown) con la siguiente estructura exacta:

    {
      "resumen_general": "Un texto breve resumiendo la salud general del inventario, explicando los riesgos y sugerencias de reposición incluyendo el nombre del item critico.",
      "metricas_clave": {
         "total_criticos": numero,
         "total_items": numero
      },
      "alertas_compra": [ 
         // LISTA SOLO CON ITEMS DE RIESGO ALTO (Cobertura < 15 días o Stock < Mínimo)
         {
            "id": "id_original",
            "nombre": "nombre_producto",
            "dias_restantes": numero,
            "cantidad_sugerida": numero,
            "motivo": "Explicación corta (ej: consumo diario comparado a dias restantes"
         }
      ],
      "stock_estancado": [
         // LISTA DE ITEMS CON 0 MOVIMIENTO EN EL PERIODO (Candidatos a ofertas)
         {
            "id": "id_original",
            "nombre": "nombre_producto",
            "stock_actual": numero,
            "dias_sin_movimiento": 90
         }
      ],
      "inventario_saludable": [
         // RESTO DE LOS ITEMS (Solo ID y Nombre para ahorrar tokens)
         { "id": "id", "nombre": "nombre" }
      ]
    }
  `;
};

module.exports = { generateInventoryPrompt };