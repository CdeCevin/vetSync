-- ======================================================================================
-- SCRIPT DE POBLADO DE DATOS - CLÍNICA OESTE (ID: 4)
-- ======================================================================================
-- FASE 3: CITAS
-- ======================================================================================

INSERT INTO
    Citas (
        id_paciente,
        id_usuario,
        fecha_cita,
        duracion_minutos,
        motivo,
        tipo_cita,
        notas,
        id_clinica,
        estado,
        activo
    )
VALUES

-- 1. Manchas (3 Citas)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT232617893'
        LIMIT 1
    ),
    72,
    '2025-11-05 10:00:00',
    30,
    'Consulta General',
    'Consulta',
    'Revisión anual',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT232617893'
        LIMIT 1
    ),
    72,
    '2025-11-20 10:00:00',
    30,
    'Vacunación',
    'Consulta',
    'Vacuna Triple Felina',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT232617893'
        LIMIT 1
    ),
    72,
    '2025-12-10 11:00:00',
    15,
    'Revisión post-vacuna',
    'Control',
    'Todo en orden',
    4,
    'completada',
    1
),

-- 2. Thor (3 Citas)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT998877665'
        LIMIT 1
    ),
    72,
    '2025-11-12 15:30:00',
    45,
    'Alergia en piel',
    'Consulta',
    'Dermatitis leve',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT998877665'
        LIMIT 1
    ),
    72,
    '2025-11-25 16:00:00',
    30,
    'Control Dermatitis',
    'Control',
    'Mejora notable',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT998877665'
        LIMIT 1
    ),
    72,
    '2025-12-09 12:00:00',
    15,
    'Alta médica',
    'Control',
    'Piel sana',
    4,
    'completada',
    1
),

-- 3. Pelusa (2 Citas)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT112233445'
        LIMIT 1
    ),
    72,
    '2025-11-15 11:00:00',
    30,
    'Molestia oído',
    'Consulta',
    'Otitis externa',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT112233445'
        LIMIT 1
    ),
    72,
    '2025-11-22 11:30:00',
    15,
    'Control Oído',
    'Control',
    'Oído limpio',
    4,
    'completada',
    1
),

-- 4. Rocky (2 Citas)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT556677889'
        LIMIT 1
    ),
    72,
    '2025-12-01 09:15:00',
    45,
    'Problema respiratorio',
    'Consulta',
    'Tos seca',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT556677889'
        LIMIT 1
    ),
    72,
    '2025-12-08 09:30:00',
    30,
    'Revisión tos',
    'Control',
    'Tos remitida',
    4,
    'completada',
    1
),

-- 5. Luna (1 Cita)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT443322110'
        LIMIT 1
    ),
    72,
    '2025-11-28 14:00:00',
    60,
    'Dolor articular',
    'Consulta',
    'Artritis crónica',
    4,
    'completada',
    1
),

-- 6. Simba (1 Cita)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT667788990'
        LIMIT 1
    ),
    72,
    '2025-12-02 16:00:00',
    30,
    'Vacunación',
    'Consulta',
    'Antirrábica y Triple',
    4,
    'completada',
    1
),

-- 7. Max (1 Cita)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT778899001'
        LIMIT 1
    ),
    72,
    '2025-12-15 12:30:00',
    50,
    'Herida en pata',
    'Urgencia',
    'Corte profundo',
    4,
    'completada',
    1
),

-- 8. Lola (1 Cita)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT889900112'
        LIMIT 1
    ),
    72,
    '2025-11-30 10:45:00',
    40,
    'Consulta esterilización',
    'Consulta',
    'Exámenes pre-quirúrgicos',
    4,
    'completada',
    1
),

-- 9. Stuart (Hamster) (2 Citas)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT990011223'
        LIMIT 1
    ),
    72,
    '2025-11-18 17:00:00',
    25,
    'Crecimiento dientes',
    'Consulta',
    'Recorte incisivos',
    4,
    'completada',
    1
),
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT990011223'
        LIMIT 1
    ),
    72,
    '2025-12-05 17:15:00',
    15,
    'Control peso',
    'Control',
    'Peso estable',
    4,
    'completada',
    1
),

-- 10. Mia (1 Cita)
(
    (
        SELECT id
        FROM Pacientes
        WHERE
            numero_microchip = 'VT001122334'
        LIMIT 1
    ),
    72,
    '2025-12-08 09:00:00',
    20,
    'Control Sano',
    'Consulta',
    'Todo bien',
    4,
    'completada',
    1
);

-- =================================================================================================
-- PHASE 3.5: INVENTORY ITEMS (Inventario_Items)
-- =================================================================================================

-- Antibióticos
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Medicamento',
        'Antibiótico amplio espectro',
        50,
        10,
        '2026-08-20',
        1,
        'Amoxicilina 500mg',
        'caja',
        'MED-001',
        '12500'
    );

-- Vacunas
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Vacuna',
        'Inmunización anual canina',
        100,
        20,
        '2025-12-30',
        1,
        'Vacuna Óctuple Canina',
        'vial',
        'VAC-002',
        '15000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Vacuna',
        'Contra la rabia',
        80,
        15,
        '2027-01-15',
        1,
        'Vacuna Antirrábica',
        'vial',
        'VAC-003',
        '12000'
    );

-- Insumos
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Jeringa estéril desechable',
        500,
        100,
        '2028-05-10',
        1,
        'Jeringa 3ml c/aguja',
        'unidad',
        'INS-004',
        '200'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Guantes de látex talla M',
        200,
        50,
        '2027-11-01',
        1,
        'Guantes de Examen M',
        'par',
        'INS-005',
        '300'
    );

-- Alimentos
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Alimento',
        'Alimento seco premium perro adulto',
        15,
        5,
        '2026-03-15',
        1,
        'Royal Canin Adulto 15kg',
        'saco',
        'ALI-006',
        '65000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Alimento',
        'Alimento húmedo gato',
        40,
        10,
        '2026-06-20',
        1,
        'Lata Pate Salmón Gato',
        'lata',
        'ALI-007',
        '2500'
    );

-- Otros Medicamentos
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Medicamento',
        'Antiinflamatorio y analgésico',
        30,
        5,
        '2026-09-10',
        1,
        'Meloxicam 2mg',
        'frasco',
        'MED-008',
        '8900'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Medicamento',
        'Antiparasitario externo tabletas',
        60,
        10,
        '2026-12-01',
        1,
        'Bravecto 20-40kg',
        'caja',
        'MED-009',
        '35000'
    );

-- Accesorios
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Accesorio',
        'Collar isabelino talla L',
        20,
        5,
        '2030-01-01',
        1,
        'Collar Isabelino L',
        'unidad',
        'ACC-010',
        '4500'
    );

-- Más Items
INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Gasas estériles sobre',
        150,
        30,
        '2028-02-28',
        1,
        'Gasas Estériles 10x10',
        'sobre',
        'INS-011',
        '500'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Medicamento',
        'Corticoide inyectable/oral',
        25,
        5,
        '2026-04-10',
        1,
        'Prednisolona 20mg',
        'caja',
        'MED-012',
        '6000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Microchip identificación ISO',
        45,
        10,
        '2030-12-31',
        1,
        'Microchip 15 dígitos',
        'unidad',
        'INS-013',
        '9000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Accesorio',
        'Correa paseador nylon',
        10,
        2,
        '2030-01-01',
        1,
        'Correa Nylon Roja 1.5m',
        'unidad',
        'ACC-014',
        '7500'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Alimento',
        'Dieta prescripción renal gato',
        8,
        3,
        '2026-02-15',
        1,
        'Hill''s k/d Gato 1.5kg',
        'saco',
        'ALI-015',
        '22000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Higiene',
        'Shampoo hipoalergénico',
        12,
        4,
        '2027-05-20',
        1,
        'Shampoo Avena 250ml',
        'botella',
        'HIG-016',
        '5900'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Suero fisiológico',
        60,
        15,
        '2026-10-10',
        1,
        'Suero NaCl 0.9% 500ml',
        'bolsa',
        'INS-017',
        '1500'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Medicamento',
        'Gotas oftálmicas antibióticas',
        15,
        3,
        '2025-11-30',
        1,
        'Tobrex Colirio',
        'frasco',
        'MED-018',
        '11000'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Insumo',
        'Hilo sutura absorbible',
        30,
        5,
        '2027-08-15',
        1,
        'Sutura Vicryl 3-0',
        'sobre',
        'INS-019',
        '3500'
    );

INSERT INTO
    Inventario_Items (
        id_clinica,
        tipo,
        descripcion,
        stock,
        stock_minimo,
        fecha_expiracion,
        activo,
        nombre,
        unidad_medida,
        codigo,
        precio
    )
VALUES (
        4,
        'Accesorio',
        'Placa identificación metal',
        50,
        10,
        '2035-01-01',
        1,
        'Placa Hueso Aluminio',
        'unidad',
        'ACC-020',
        '1500'
    );

-- =================================================================================================
-- PHASE 4: MEDICAL HISTORY (Historial_Medico)
-- =================================================================================================

-- 1. Manchas (3 Visitas)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT232617893'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT232617893'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-05 10:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-05 10:00:00',
        'Paciente Sano',
        'Peso: 4.5kg, T: 38.5C, FC: 120, FR: 30. Examen físico normal. Pelaje brillante. Sin ectoparásitos.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT232617893'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT232617893'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-20 10:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-20 10:00:00',
        'Vacunación Anual',
        'Peso: 4.5kg, T: 38.5C, FC: 120, FR: 30. Examen físico normal. Pelaje brillante. Sin ectoparásitos.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT232617893'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT232617893'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-10 11:00:00'
            LIMIT 1
        ),
        72,
        '2025-12-10 11:00:00',
        'Control Post-Vacuna',
        'Peso: 4.5kg, T: 38.6C, FC: 122, FR: 32. Paciente se encuentra bien, sin reacciones adversas a la vacuna anterior.',
        4
    );

-- 2. Thor (3 Visitas)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT998877665'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT998877665'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-12 15:30:00'
            LIMIT 1
        ),
        72,
        '2025-11-12 15:30:00',
        'Dermatitis Alérgica',
        'Peso: 32.0kg, T: 39.1C, FC: 90, FR: 24. Presenta eritema y prurito en zona dorsal. Posible alergia alimentaria o ambiental.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT998877665'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT998877665'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-25 16:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-25 16:00:00',
        'Control Dermatitis - Mejora',
        'Peso: 31.8kg, T: 38.5C, FC: 88, FR: 22. Lesiones han disminuido un 80%. Continúa tratamiento.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT998877665'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT998877665'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-09 12:00:00'
            LIMIT 1
        ),
        72,
        '2025-12-09 12:00:00',
        'Alta Médica',
        'Peso: 32.2kg, T: 38.3C, FC: 85, FR: 20. Piel completamente sana. Se da de alta.',
        4
    );

-- 3. Pelusa (2 Visitas)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT112233445'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT112233445'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-15 11:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-15 11:00:00',
        'Otitis Externa',
        'Peso: 3.2kg, T: 39.2C, FC: 130, FR: 35. Secreción ceruminosa en oído derecho. Dolor a la palpación.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT112233445'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT112233445'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-22 11:30:00'
            LIMIT 1
        ),
        72,
        '2025-11-22 11:30:00',
        'Control Otitis - Remisión',
        'Peso: 3.3kg, T: 38.5C, FC: 125, FR: 30. Oído limpio, membrana timpánica íntegra.',
        4
    );

-- 4. Rocky (2 Visitas)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT556677889'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT556677889'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-01 09:15:00'
            LIMIT 1
        ),
        72,
        '2025-12-01 09:15:00',
        'Traqueobronquitis Infecciosa',
        'Peso: 8.5kg, T: 39.5C, FC: 110, FR: 40. Tos seca paroxística. "Tos de las perreras".',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT556677889'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT556677889'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-08 09:30:00'
            LIMIT 1
        ),
        72,
        '2025-12-08 09:30:00',
        'Control Respiratorio',
        'Peso: 8.4kg, T: 38.4C, FC: 100, FR: 25. Tos ha remitido casi por completo. Pulmones limpios.',
        4
    );

-- 5. Luna (1 Visita)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT443322110'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT443322110'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-28 14:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-28 14:00:00',
        'Artrosis de Cadera',
        'Peso: 28.0kg, T: 38.2C, FC: 75, FR: 18. Dolor a la extensión de cadera. Marcha rígida en frío.',
        4
    );

-- 6. Simba (1 Visita)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT667788990'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT667788990'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-02 16:00:00'
            LIMIT 1
        ),
        72,
        '2025-12-02 16:00:00',
        'Paciente Sano - Vacunación',
        'Peso: 25.0kg, T: 38.5C, FC: 80, FR: 20. Examen clínico sin hallazgos. Se procede a vacunar.',
        4
    );

-- 7. Max (1 Visita)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT778899001'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT778899001'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-15 12:30:00'
            LIMIT 1
        ),
        72,
        '2025-12-15 12:30:00',
        'Laceración Cutánea',
        'Peso: 12.0kg, T: 38.8C, FC: 110, FR: 30. Corte profundo en almohadilla plantar miembro anterior derecho.',
        4
    );

-- 8. Lola (1 Visita)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT889900112'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT889900112'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-30 10:45:00'
            LIMIT 1
        ),
        72,
        '2025-11-30 10:45:00',
        'Apta para Cirugía',
        'Peso: 5.0kg, T: 38.3C, FC: 130, FR: 30. Evaluación pre-quirúrgica para esterilización. Examen físico normal.',
        4
    );

-- 9. Stuart (2 Visitas)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT990011223'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT990011223'
                    LIMIT 1
                )
                AND fecha_cita = '2025-11-18 17:00:00'
            LIMIT 1
        ),
        72,
        '2025-11-18 17:00:00',
        'Sobrecrecimiento Dental',
        'Peso: 0.12kg, T: 37.5C, FC: 350, FR: 60. Incisivos inferiores sobrepasando límite normal. Dificultad para comer.',
        4
    );

INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT990011223'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT990011223'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-05 17:15:00'
            LIMIT 1
        ),
        72,
        '2025-12-05 17:15:00',
        'Obesidad Leve',
        'Peso: 0.13kg, T: 37.4C, FC: 340, FR: 58. Ha ganado peso. Se recomienda ajustar dieta.',
        4
    );

-- 10. Mia (1 Visita)
INSERT INTO
    Historial_Medico (
        id_paciente,
        id_cita,
        id_usuario,
        fecha_visita,
        diagnostico,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Pacientes
            WHERE
                numero_microchip = 'VT001122334'
            LIMIT 1
        ),
        (
            SELECT id
            FROM Citas
            WHERE
                id_paciente = (
                    SELECT id
                    FROM Pacientes
                    WHERE
                        numero_microchip = 'VT001122334'
                    LIMIT 1
                )
                AND fecha_cita = '2025-12-08 09:00:00'
            LIMIT 1
        ),
        72,
        '2025-12-08 09:00:00',
        'Control Sano',
        'Peso: 4.0kg, T: 38.5C, FC: 120, FR: 28. Todo normal.',
        4
    );

-- =================================================================================================
-- PHASE 5: PROCEDURES & TREATMENTS (Procedimientos y Tratamientos)
-- =================================================================================================

-- 1. Manchas (20 Nov): Procedimiento Vacunación
INSERT INTO
    Procedimientos (
        id_historial_medico,
        nombre_procedimiento,
        realizado_en,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-20 10:00:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT232617893'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        'Administración Vacuna Triple',
        '2025-11-20 10:15:00',
        'Subcutánea interescapular',
        4
    );

-- 2. Thor (12 Nov): Tratamiento para Dermatitis
-- Meloxicam (Antiinflamatorio), Champú (Higiene)
INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-12 15:30:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT998877665'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-11-12',
        '1/2 tableta',
        'Dar con comida una vez al día.',
        5,
        'Para la inflamación',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'MED-008'
            LIMIT 1
        ) -- Meloxicam
    ),
    (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-12 15:30:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT998877665'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-11-12',
        'Aplicación local',
        'Bañar cada 3 días dejándo actuar 10 min.',
        15,
        'Shampoo medicado',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'HIG-016'
            LIMIT 1
        ) -- Shampoo
    );

-- 3. Pelusa (15 Nov): Tratamiento Otitis
INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-15 11:00:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT112233445'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-11-15',
        '3 gotas',
        'Aplicar en oído derecho cada 12 horas.',
        7,
        'Limpiar antes de aplicar',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'MED-018'
            LIMIT 1
        ) -- Gotas (usando las oftálmicas como genérico de gotas antibióticas del inventario)
    );

-- 4. Rocky (01 Dec): Tratamiento Tos
INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-12-01 09:15:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT556677889'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-12-01',
        '500 mg',
        '1 comprimido cada 12 horas',
        10,
        'Antibiótico para infección',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'MED-001'
            LIMIT 1
        ) -- Amoxicilina
    );

-- 5. Luna (28 Nov): Tratamiento Artritis
INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-28 14:00:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT443322110'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-11-28',
        '2 mg/kg',
        'Una vez al día por 5 días si hay dolor',
        5,
        'Manejo del dolor agudo',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'MED-008'
            LIMIT 1
        ) -- Meloxicam
    );

-- 6. Simba (02 Dec): Procedimiento Vacunación (Antirrábica)
INSERT INTO
    Procedimientos (
        id_historial_medico,
        nombre_procedimiento,
        realizado_en,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-12-02 16:00:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT667788990'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        'Administración Vacuna Antirrábica',
        '2025-12-02 16:15:00',
        'Subcutánea',
        4
    );

-- 7. Max (15 Dec): Procedimiento Sutura + Tratamiento
INSERT INTO
    Procedimientos (
        id_historial_medico,
        nombre_procedimiento,
        realizado_en,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-12-15 12:30:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT778899001'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        'Sutura herida plantar',
        '2025-12-15 12:45:00',
        'Limpieza y 3 puntos simples con Vicryl',
        4
    );

INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-12-15 12:30:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT778899001'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-12-15',
        '1 tableta',
        'Cada 8 horas por 7 días',
        7,
        'Prevención infección',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'MED-001'
            LIMIT 1
        ) -- Amoxicilina
    );

-- 8. Lola (30 Nov): Procedimiento Toma de Muestras
INSERT INTO
    Procedimientos (
        id_historial_medico,
        nombre_procedimiento,
        realizado_en,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-30 10:45:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT889900112'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        'Toma de muestra sangre',
        '2025-11-30 11:00:00',
        'Vena cefálica. Hemograma y perfil.',
        4
    );

-- 9. Stuart (18 Nov): Procedimiento Corte Dientes
INSERT INTO
    Procedimientos (
        id_historial_medico,
        nombre_procedimiento,
        realizado_en,
        notas,
        id_clinica
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-11-18 17:00:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT990011223'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        'Recorte de Incisivos',
        '2025-11-18 17:10:00',
        'Con micromotor. Paciente tranquilo.',
        4
    );

-- 9. Stuart (05 Dec): Tratamiento Dieta (usando Alimento como item)
INSERT INTO
    Tratamientos (
        id_historial_medico,
        prescripto_por,
        id_clinica,
        fecha_prescripcion,
        dosis,
        instrucciones,
        duracion_dias,
        notas,
        id_medicamento
    )
VALUES (
        (
            SELECT id
            FROM Historial_Medico
            WHERE
                id_cita = (
                    SELECT id
                    FROM Citas
                    WHERE
                        fecha_cita = '2025-12-05 17:15:00'
                        AND id_paciente = (
                            SELECT id
                            FROM Pacientes
                            WHERE
                                numero_microchip = 'VT990011223'
                            LIMIT 1
                        )
                    LIMIT 1
                )
            LIMIT 1
        ),
        72,
        4,
        '2025-12-05',
        '10g diarios',
        'Solo pellets, sin semillas grasas.',
        30,
        'Dieta estricta',
        (
            SELECT id
            FROM Inventario_Items
            WHERE
                codigo = 'ALI-006'
            LIMIT 1
        ) -- Usando alimento perro como placeholder de alimento a granel en inventario
    );

-- FIN DE POBLADO DE DATOS