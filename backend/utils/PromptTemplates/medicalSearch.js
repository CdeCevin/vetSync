/**
 * Generates the prompt for the Gemini model to perform smart search on medical records.
 * @param {Array} historyData - Array of objects containing medical history context.
 * @param {String} userQuery - The natural language query from the veterinarian.
 * @returns {String} The formatted prompt.
 */
const generateMedicalSearchPrompt = (historyData, userQuery) => {
  return `
    Eres un asistente veterinario experto en análisis de historiales clínicos.
    Tu tarea es buscar en los siguientes registros médicos aquellos que coincidan con la consulta del usuario.

    Consulta del Veterinario: "${userQuery}"

    Base de Datos de Historiales (JSON):
    ${JSON.stringify(historyData, null, 2)}

    Instrucciones:
    1. Analiza semánticamente la consulta y los registros.
    2. Si la consulta se refiere a un paciente específico (ej: "Manchas"), genera un "resumen_paciente" con datos clave (edad, especie, raza) y un "analisis_general" de su historial (frecuencia de visitas, problemas recurrentes, estado general).
    3. Si la consulta es general (ej: "todos los gatos"), el resumen y análisis deben ser sobre el grupo encontrado.
    4. Selecciona los historiales más relevantes para la lista de "resultados_registros".

    Formato de Respuesta (EXCLUSIVAMENTE JSON):
    Devuelve un ÚNICO objeto JSON con la siguiente estructura, sin texto adicional ni markdown:
    {
      "resumen_paciente": "Texto con información importante del paciente (ej: 'Manchas es un gato de 8 años...'). Si no aplica, null.",
      "analisis_general": "Texto con un resumen clínico general basado en los registros (e.j: 'Tiene buena salud general, aunque presenta historial de dermatitis...').",
      "resultados_registros": [
        {
          "id": numero, 
          "relevancia": numero, // 1-100
          "fragmento_destacado": "Texto breve justificando la coincidencia, con claves entre **asteriscos**",
          "razon": "Explicación breve"
        }
      ]
    }
  `;
};

module.exports = { generateMedicalSearchPrompt };
