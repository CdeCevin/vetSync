-- Clínicas
INSERT INTO Clinicas (nombre, direccion, telefono, correo) VALUES
('Clínica Central', 'Av. Siempre Viva 123', '1234567890', 'central@vet.com'),
('Clínica Sur', 'Calle Sur 456', '0987654321', 'sur@vet.com'),
('Clínica Norte', 'Calle Norte 789', '1231231234', 'norte@vet.com'),
('Clínica Oeste', 'Boulevard Oeste 147', '2342342345', 'oeste@vet.com');

-- Roles
INSERT INTO Roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo'),
('Veterinario', 'Atiende pacientes'),
('Recepcionista', 'Atención y registro'),
('Ayudante', 'Apoyo en procedimientos'),
('Gerente', 'Gestión de la clínica');

-- Usuarios
INSERT INTO Usuarios (id_clinica, id_rol, hash_contraseña, nombre_completo, correo_electronico) VALUES
(1, 1, 'hash123', 'Sara Castro', 'sara@vet.com'),
(2, 2, 'hash234', 'Carlos Díaz', 'carlos@vet.com'),
(1, 3, 'hash345', 'Lucía López', 'lucia@vet.com'),
(3, 5, 'hash456', 'Mario Vázquez', 'mario@vet.com'),
(4, 2, 'hash567', 'Gloria Ramírez', 'gloria@vet.com');

-- Dueños
INSERT INTO Dueños (nombre, telefono, correo, direccion, id_clinica) VALUES
('Juan Pérez', '1122334455', 'juan@email.com', 'Avenida 1 #101', 1),
('Ana Gómez', '2233445566', 'ana@email.com', 'Calle 2 #202', 2),
('Pedro Torres', '3344556677', 'pedro@email.com', 'Boulevard 3 #303', 1),
('Paula Silva', '4455667788', 'paula@correo.com', 'Calle Norte 25', 3),
('Luis Figueroa', '5566778899', 'luis@correo.com', 'Boulevard Oeste 100', 4);

-- Pacientes
INSERT INTO Pacientes (nombre, especie, raza, color, edad, numero_microchip, id_dueño, id_clinica) VALUES
('Milo', 'Perro', 'Labrador', 'Negro', '2018-05-10', 'MC123456', 1, 1),
('Luna', 'Gato', 'Siames', 'Gris', '2020-08-01', 'MC654321', 2, 2),
('Rocky', 'Perro', 'Bulldog', 'Marrón', '2017-01-22', 'MC789012', 3, 1),
('Bella', 'Perro', 'Golden Retriever', 'Dorado', '2019-03-12', 'MC456789', 4, 3),
('Coco', 'Gato', 'Persa', 'Blanco', '2021-02-18', 'MC321654', 5, 4);

-- Citas
INSERT INTO Citas (id_paciente, id_usuario, fecha_cita, duracion_minutos, motivo, id_clinica) VALUES
(1, 1, '2025-09-15 09:00:00', 30, 'Vacunación anual', 1),
(2, 2, '2025-09-16 10:30:00', 45, 'Consulta general', 2),
(3, 3, '2025-09-17 11:15:00', 20, 'Revisión de piel', 1),
(4, 4, '2025-09-18 08:00:00', 40, 'Desparasitación', 3),
(5, 5, '2025-09-19 14:30:00', 30, 'Cirugía menor', 4);

-- Historial Médico
INSERT INTO Historial_Medico (id_paciente, id_cita, id_usuario, fecha_visita, diagnostico, notas, id_clinica) VALUES
(1, 1, 1, '2025-09-15 09:30:00', 'Salud excelente', 'Sin problemas', 1),
(2, 2, 2, '2025-09-16 11:15:00', 'Otitis leve', 'Antibióticos recetados', 2),
(3, 3, 3, '2025-09-17 12:00:00', 'Dermatitis', 'Tratamiento tópico', 1),
(4, 4, 4, '2025-09-18 08:45:00', 'Parásitos internos', 'Tratamiento de un día', 3),
(5, 5, 5, '2025-09-19 15:00:00', 'Herida superficial', 'Sutura realizada', 4);

-- Procedimientos
INSERT INTO Procedimientos (id_historial_medico, nombre_procedimiento, realizado_en, notas, id_clinica) VALUES
(1, 'Vacunación', '2025-09-15 09:30:00', 'Vacuna aplicada', 1),
(2, 'Limpieza de oídos', '2025-09-16 11:15:00', 'Procedimiento exitoso', 2),
(3, 'Aplicación de crema', '2025-09-17 12:00:00', 'Crema recetada', 1),
(4, 'Desparasitante oral', '2025-09-18 08:50:00', 'Paciencia y eficacia', 3),
(5, 'Sutura', '2025-09-19 15:02:00', '2 puntos realizados', 4);

-- Vacunaciones
INSERT INTO Vacunaciones (id_paciente, nombre_vacuna, fecha_vacuna, dosis, id_historial_medico, id_clinica) VALUES
(1, 'Rabia', '2025-09-15', '1ml', 1, 1),
(2, 'Triple Felina', '2025-09-16', '0.5ml', 2, 2),
(3, 'Parvovirus', '2025-09-17', '1ml', 3, 1),
(4, 'Parvovirus', '2025-09-18', '1.2ml', 4, 3),
(5, 'Leucemia Felina', '2025-09-19', '0.8ml', 5, 4);

-- Tratamientos
INSERT INTO Tratamientos (id_historial_medico, prescripto_por, id_clinica, fecha_prescripcion, dosis, instrucciones, duracion_dias, notas, id_medicamento) VALUES
(1, 1, 1, '2025-09-15', '1 ml', 'Aplicar cada año', 1, 'Vacuna completada', 1),
(2, 2, 2, '2025-09-16', '3 gotas', 'Aplicar en oídos cada 12h', 7, 'Antibiótico administrado', 2),
(3, 3, 1, '2025-09-17', 'Aplicar', 'Crema en zona afectada', 10, 'Tratamiento en curso', 3),
(4, 4, 3, '2025-09-18', '2 pastillas', 'Oral cada 12h', 3, 'Desparasitante administrado', 4),
(5, 5, 4, '2025-09-19', 'Vendar', 'Cambiar cada 2 días', 5, 'Tratamiento de la herida', 5);

-- Inventario_Items
INSERT INTO Inventario_Items (id_clinica, tipo, descripcion, cantidad_inicial, stock_minimo, fecha_expiracion, proveedor) VALUES
(1, 'Vacuna', 'Vacuna antirrábica', 10, 2, '2026-09-13', 'LabVet'),
(2, 'Medicamento', 'Antibiótico gotas oídas', 20, 5, '2027-01-01', 'PharmaPet'),
(1, 'Crema', 'Crema dermatológica', 15, 3, '2026-12-31', 'Dermapet'),
(3, 'Desparasitante', 'Pastillas antiparasitarias', 30, 5, '2027-03-01', 'VetHealth'),
(4, 'Material', 'Sutura absorbible', 40, 10, '2026-07-15', 'SuturePet');

-- Movimientos_Inventario
INSERT INTO Movimientos_Inventario (id_clinica, realizado_por, tipo_movimiento, cantidad, motivo, id_item) VALUES
(1, 1, 'Salida', 1, 'Aplicación vacuna', 1),
(2, 2, 'Salida', 1, 'Tratamiento otitis', 2),
(1, 3, 'Salida', 1, 'Aplicación crema', 3),
(3, 4, 'Salida', 1, 'Tratamiento parásitos', 4),
(4, 5, 'Salida', 2, 'Sutura para cirugía', 5);

-- Registros_Auditoria
INSERT INTO Registros_Auditoria (id_usuario, id_clinica, accion, entidad, id_entidad, detalles) VALUES
(1, 1, 'INSERT', 'Paciente', 1, 'Nuevo paciente registrado'),
(2, 2, 'UPDATE', 'Historial_Medico', 2, 'Diagnóstico actualizado'),
(3, 1, 'INSERT', 'Tratamiento', 3, 'Nuevo tratamiento aplicado'),
(4, 3, 'INSERT', 'Vacunación', 4, 'Nuevo registro de vacuna parvovirus'),
(5, 4, 'UPDATE', 'Procedimiento', 5, 'Sutura realizada y registrada');


