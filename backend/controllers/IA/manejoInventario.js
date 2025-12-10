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
        console.log("--- INICIANDO PREDICCIÓN ---");

        // 1. Obtener items
        const items = await query(`
            SELECT id, nombre, stock, stock_minimo, unidad_medida 
            FROM Inventario_Items 
            WHERE id_clinica = ? AND Activo = 1
        `, [id_clinica]);

        if (items.length === 0) return res.status(200).json({ resumen: "Sin datos", alertas_compra: [] });

        // 2. Obtener movimientos (CORREGIDO PARA MAYÚSCULAS/MINÚSCULAS)
        // Usamos UPPER() para asegurar que 'salida', 'Salida' y 'SALIDA' cuenten igual
        const movimientos = await query(`
            SELECT id_item, cantidad, creado_en 
            FROM Movimientos_Inventario 
            WHERE id_clinica = ? 
            AND UPPER(tipo_movimiento) IN ('SALIDA', 'SALIDA_MEDICA', 'VENTA', 'CONSUMO_INTERNO')
            AND creado_en >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        `, [id_clinica]);

        console.log(`Items encontrados: ${items.length}`);
        console.log(`Movimientos encontrados (90 días): ${movimientos.length}`);

        // 3. Estructurar datos (CORRECCIÓN CRÍTICA DE TIPOS)
        const inventoryData = items.map(item => {
            // TRUCO: Convertimos ambos ID a String para evitar error Number vs String
            const salidasItem = movimientos.filter(m => String(m.id_item) === String(item.id));

            const totalSalidas = salidasItem.reduce((acc, curr) => acc + curr.cantidad, 0);

            // LOG DE DEPURACIÓN: Si es la jeringa (ID 30), muéstrame qué encontró
            if (item.id == 30) {
                console.log(`DEBUG ITEM 30 (Jeringa): Movimientos encontrados: ${salidasItem.length}, Total Salidas: ${totalSalidas}`);
            }

            return {
                id: item.id,
                nombre: item.nombre,
                stock_actual: item.stock,
                stock_minimo: item.stock_minimo,
                unidad: item.unidad_medida,
                total_salidas_90_dias: totalSalidas,
                detalle_salidas: salidasItem.map(s => ({
                    // Aseguramos formato de fecha corto YYYY-MM-DD
                    fecha: new Date(s.creado_en).toISOString().split('T')[0],
                    cantidad: s.cantidad
                }))
            };
        });

        // 4. Gemini (Sin cambios mayores, solo el modelo)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Usamos la versión estable
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = generateInventoryPrompt(inventoryData);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 5. Limpieza JSON
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }

        let aiResponse;
        try {
            aiResponse = JSON.parse(text);
        } catch (e) {
            console.error("JSON Roto:", text);
            return res.status(500).json({ error: "Error parsing AI response" });
        }

        // 6. Rehidratación (Merge)
        const enriquecerItems = (listaItemsIA) => {
            if (!Array.isArray(listaItemsIA)) return [];
            return listaItemsIA.map(itemIA => {
                // Usamos '==' por si acaso la IA devuelve el ID como string o number
                const datosOriginales = inventoryData.find(d => d.id == itemIA.id);
                return {
                    ...itemIA,
                    stock_actual: datosOriginales ? datosOriginales.stock_actual : 0,
                    stock_minimo: datosOriginales ? datosOriginales.stock_minimo : 0,
                    unidad: datosOriginales ? datosOriginales.unidad : '',
                    historial_movimientos: datosOriginales ? datosOriginales.detalle_salidas : []
                };
            });
        };

        const respuestaFinal = {
            resumen_general: aiResponse.resumen_general,
            metricas_clave: aiResponse.metricas_clave,
            alertas_compra: enriquecerItems(aiResponse.alertas_compra),
            stock_estancado: enriquecerItems(aiResponse.stock_estancado),
            inventario_saludable: enriquecerItems(aiResponse.inventario_saludable)
        };

        // Auditoría
        const logAuditoria = require('../../utils/auditLogger');
        await logAuditoria({
            id_usuario: req.usuario.id,
            id_clinica: id_clinica,
            accion: 'PREDICCION_INVENTARIO',
            entidad: 'Inventario',
            id_entidad: 0,
            detalles: `Resumen de inventario IA: ${respuestaFinal.resumen_general}`
        });

        res.json(respuestaFinal);

    } catch (error) {
        console.error('Error Fatal en Predicción Inventario:', error);

        let errorMessage = 'Error interno del servidor';
        let errorDetails = error.message;

        if (error.message?.includes('GoogleGenerativeAI')) {
            errorMessage = 'Error en el servicio de IA (Gemini)';
        } else if (error.code && (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR')) {
            errorMessage = 'Error de conexión con la base de datos';
        }

        res.status(500).json({ error: errorMessage, details: errorDetails });
    }
};

module.exports = { getInventoryPrediction };