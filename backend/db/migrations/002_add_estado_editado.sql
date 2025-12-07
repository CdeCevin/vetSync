ALTER TABLE Tratamientos
ADD COLUMN estado ENUM(
    'Activo',
    'Completado',
    'Cancelado'
) DEFAULT 'Activo' AFTER notas,
ADD COLUMN editado BOOLEAN DEFAULT FALSE AFTER estado;