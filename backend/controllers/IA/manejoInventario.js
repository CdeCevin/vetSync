const { GoogleGenerativeAI } = require("@google/generative-ai");
const connection = require('../../db/connection');
const util = require('util');
const { generateInventoryPrompt } = require('../../utils/PromptTemplates/inventoryPrediction');

const query = util.promisify(connection.query).bind(connection);

const getInventoryPrediction = async (req, res) => {
    const id_clinica = req.clinicaId;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key de Gemini no configurada' });
    }

    try {
        // 1. Obtener items activos
        const items = await query(`
            SELECT id, nombre, stock, stock_minimo, unidad_medida 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1
        `, [id_clinica]);

        if (items.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Obtener historial de salidas (últimos 90 días)
        const movimientos = await query(`
            SELECT id_item, cantidad, creado_en 
            FROM Movimientos_Inventario 
            WHERE id_clinica = ? 
            AND tipo_movimiento = 'salida' 
            AND creado_en >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        `, [id_clinica]);

        // 3. Estructurar datos para la IA (OPTIMIZADO)
        const inventoryData = items.map(item => {
            const salidasItem = movimientos.filter(m => m.id_item === item.id);
            const totalSalidas = salidasItem.reduce((acc, curr) => acc + curr.cantidad, 0);

            return {
                id: item.id,
                nombre: item.nombre,
                stock_actual: item.stock,
                stock_minimo: item.stock_minimo,
                unidad: item.unidad_medida, // Útil para que la IA sepa si son ml o cajas
                total_salidas_90_dias: totalSalidas,
                // Mapeo limpio para ahorrar tokens y dar claridad
                detalle_salidas: salidasItem.map(s => ({
                    fecha: new Date(s.creado_en).toISOString().split('T')[0],
                    cantidad: s.cantidad
                }))
            };
        });

        // 4. Preparar Prompt y llamar a Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // CORRECCIÓN: Usar modelo existente
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Forzamos modo JSON nativo si usas la SDK nueva
        });

        const prompt = generateInventoryPrompt(inventoryData);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 5. Limpieza Robusta de JSON
        // Busca desde el primer '[' hasta el último ']'
        const jsonStartIndex = text.indexOf('[');
        const jsonEndIndex = text.lastIndexOf(']');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        const predictions = JSON.parse(text);

        // PASO CLAVE: Combinar la inteligencia de la IA con los datos duros de la DB
        const respuestaFinal = predictions.map(prediccion => {
            // Buscamos los datos originales que le enviamos a la IA
            // Nota: Aseguramos que los IDs sean comparables (String vs Number)
            const datosOriginales = inventoryData.find(d => d.id == prediccion.id);

            return {
                ...prediccion, // Mantiene id, nombre, riesgo, justificacion, etc.
                stock_actual: datosOriginales ? datosOriginales.stock_actual : 0,
                stock_minimo: datosOriginales ? datosOriginales.stock_minimo : 0,
                unidad: datosOriginales ? datosOriginales.unidad : '',
                // AQUÍ ESTÁ LA MAGIA PARA TU GRÁFICO:
                historial_movimientos: datosOriginales ? datosOriginales.detalle_salidas : []
            };
        });

        res.json(respuestaFinal);

    } catch (error) {
        console.error('Error en predicción de inventario:', error);
        // Devolvemos un error controlado pero útil
        res.status(500).json({
            error: 'Error al generar predicción',
            details: error.message
        });
    }
};

module.exports = { getInventoryPrediction };