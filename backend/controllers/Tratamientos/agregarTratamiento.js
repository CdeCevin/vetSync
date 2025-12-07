const pool = require('../../db/connection');
const util = require('util');

exports.agregarTratamiento = async (req, res) => {
    const {
        id_paciente,
        id_historial_medico,
        prescripto_por,
        fecha_prescripcion,
        id_medicamento,
        dosis,
        cantidad, // Campo nuevo
        instrucciones,
        duracion_dias,
        notas
    } = req.body;

    const id_clinica = req.clinicaId;

    // Validación básica
    if (!id_paciente || !prescripto_por || !id_medicamento || !dosis || !cantidad) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: id_paciente, prescripto_por, id_medicamento, dosis, cantidad.' });
    }

    const getConnection = util.promisify(pool.getConnection).bind(pool);
    let connection;

    try {
        connection = await getConnection();
        const queryTx = util.promisify(connection.query).bind(connection);
        const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
        const commit = util.promisify(connection.commit).bind(connection);
        const rollback = util.promisify(connection.rollback).bind(connection);

        await beginTransaction();

        // 1. Verificar Stock del Medicamento (Bloqueo pesimista para evitar condiciones de carrera)
        const items = await queryTx(
            'SELECT id, descripcion, stock FROM Inventario_Items WHERE id = ? AND id_clinica = ? FOR UPDATE',
            [id_medicamento, id_clinica]
        );

        if (items.length === 0) {
            throw new Error('Medicamento no encontrado en el inventario.');
        }

        const item = items[0];
        if (item.stock < cantidad) { // Changed .cantidad to .stock based on previous learnings
            // Actually, the previous code used item.cantidad but the column is stock?
            // Let's look at `crearHistorial` logic which used `stock`. 
            // Wait, the previous file had `if (item.cantidad < cantidad)`. 
            // `SELECT id, descripcion, stock` returns `stock`. So `item.stock` is correct. 
            // I will fix this bug here too.
            throw new Error(`Stock insuficiente para ${item.descripcion}. Disponible: ${item.stock}, Solicitado: ${cantidad}`);
        }

        // 2. Insertar Tratamiento
        const queryTratamiento = `
            INSERT INTO Tratamientos 
            (id_paciente, id_historial_medico, prescripto_por, id_clinica, fecha_prescripcion, dosis, cantidad, instrucciones, duracion_dias, notas, id_medicamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Usar fecha actual si no viene
        const fecha = fecha_prescripcion || new Date();

        const resultTratamiento = await queryTx(queryTratamiento, [
            id_paciente,
            id_historial_medico || null,
            prescripto_por,
            id_clinica,
            fecha,
            dosis,
            cantidad,
            instrucciones,
            duracion_dias,
            notas,
            id_medicamento
        ]);

        const idTratamiento = resultTratamiento.insertId;

        // 3. Actualizar Inventario (Restar Stock)
        await queryTx(
            'UPDATE Inventario_Items SET stock = stock - ? WHERE id = ?',
            [cantidad, id_medicamento]
        );

        // 4. Registrar Movimiento de Inventario
        await queryTx(
            'INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES (?, ?, ?, ?, ?, ?)',
            [id_clinica, prescripto_por, 'SALIDA', cantidad, `Tratamiento #${idTratamiento} - Paciente #${id_paciente}`, id_medicamento]
        );

        // 5. Registrar Auditoría
        await queryTx(
            'INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES (?, ?, ?, ?, ?, ?)',
            [
                prescripto_por,
                id_clinica,
                'CREAR',
                'Tratamientos',
                idTratamiento,
                `Tratamiento creado para paciente ${id_paciente}. Medicamento: ${item.descripcion}, Cantidad: ${cantidad}`
            ]
        );

        // Confirmar transacción
        await commit();

        res.status(201).json({
            message: 'Tratamiento agregado correctamente',
            id: idTratamiento
        });

    } catch (error) {
        if (connection) {
            try {
                const rollback = util.promisify(connection.rollback).bind(connection);
                await rollback();
            } catch (rbError) {
                console.error("Rollback error:", rbError);
            }
        }
        console.error('Error en agregarTratamiento:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};
