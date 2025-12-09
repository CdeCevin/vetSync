const { GoogleGenerativeAI } = require("@google/generative-ai");
const connection = require('../../db/connection');
const util = require('util');
const { generateMedicalSearchPrompt } = require('../../utils/PromptTemplates/medicalSearch');

const query = util.promisify(connection.query).bind(connection);

const searchMedicalHistorySmart = async (req, res) => {
    const id_clinica = req.clinicaId;
    const { consulta } = req.body; // Texto de búsqueda en lenguaje natural
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key de Gemini no configurada' });
    }

    if (!consulta) {
        return res.status(400).json({ error: 'La consulta es requerida' });
    }

    try {
        // 1. Obtener base de historiales (Contexto para la IA)
        // Traemos un conjunto amplio de datos recientes para que la IA filtre.
        // Limitamos a 500 por seguridad y rendimiento, asumiendo que es suficiente para "historial reciente/relevante".
        // La IA podrá filtrar por fecha si la consulta lo pide (ej: "últimos 6 meses"), siempre que los datos estén en este set.
        const sql = `
            SELECT 
                h.id,
                h.fecha_visita,
                h.diagnostico,
                h.notas,
                p.nombre AS paciente,
                p.especie,
                p.raza,
                p.edad,
                (
                    SELECT GROUP_CONCAT(nombre_procedimiento SEPARATOR ', ')
                    FROM Procedimientos proc 
                    WHERE proc.id_historial_medico = h.id 
                ) as procedimientos,
                (
                    SELECT GROUP_CONCAT(ii.nombre SEPARATOR ', ')
                    FROM Tratamientos t
                    JOIN Inventario_Items ii ON t.id_medicamento = ii.id
                    WHERE t.id_historial_medico = h.id
                ) as tratamientos
            FROM Historial_Medico h
            JOIN Pacientes p ON h.id_paciente = p.id
            WHERE h.id_clinica = ? AND h.activo = 1
            ORDER BY h.fecha_visita DESC
            LIMIT 500
        `;

        const histories = await query(sql, [id_clinica]);

        if (histories.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Simplificar y preparar datos para ahorrar tokens (aunque Flash tiene 1M, es buena práctica)
        const contextData = histories.map(h => ({
            id: h.id,
            fecha: new Date(h.fecha_visita).toLocaleDateString(),
            diagnostico: h.diagnostico,
            notas: h.notas,
            paciente: `${h.paciente} (${h.edad}) (${h.especie} ${h.raza || ''})`,
            procedimientos: h.procedimientos || '',
            tratamientos: h.tratamientos || ''
        }));

        // 3. Llamar a Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = generateMedicalSearchPrompt(contextData, consulta);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 4. Limpieza de JSON
        // Busca desde el primer '{' hasta el último '}' porque ahora esperamos un OBJETO, no un array
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        const aiOutput = JSON.parse(text);

        // Desestructuramos la respuesta de la IA
        const { resumen_paciente, analisis_general, resultados_registros } = aiOutput;

        // 5. Enriquecer respuesta con datos originales
        const enrichedResults = (resultados_registros || []).map(match => {
            const original = contextData.find(d => d.id === match.id);
            return {
                ...match,
                paciente: original ? original.paciente : 'Desconocido',
                fecha: original ? original.fecha : '',
                diagnostico_completo: original ? original.diagnostico : ''
            };
        });

        // Estructura final solicitada por el usuario
        const responseData = {
            resumen_paciente: resumen_paciente || null,
            analisis_general: analisis_general || null,
            registros: enrichedResults
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error en búsqueda inteligente:', error);
        res.status(500).json({
            error: 'Error al procesar la búsqueda inteligente',
            details: error.message
        });
    }
};

module.exports = { searchMedicalHistorySmart };
