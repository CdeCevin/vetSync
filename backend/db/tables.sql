CREATE TABLE Clinicas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(11),
    correo VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Dueños (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(11),
    correo VARCHAR(255),
    direccion VARCHAR(255),
    id_clinica INT UNSIGNED,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE INDEX unique_correo (correo),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Pacientes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    especie VARCHAR(50),
    raza VARCHAR(50),
    color VARCHAR(50),
    edad DATE,
    numero_microchip VARCHAR(100),
    id_dueño INT UNSIGNED,
    id_clinica INT UNSIGNED,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_dueño) REFERENCES Dueños(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE Usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_clinica INT UNSIGNED,
    id_rol INT UNSIGNED,
    hash_contraseña VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE INDEX unique_correo_electronico (correo_electronico),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id),
    FOREIGN KEY (id_rol) REFERENCES Roles(id)
);

CREATE TABLE Citas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT UNSIGNED,
    id_usuario INT UNSIGNED,
    fecha_cita TIMESTAMP NOT NULL,
    duracion_minutos INT,
    motivo VARCHAR(255),
    tipo_cita VARCHAR(50),
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_clinica INT UNSIGNED,
    estado VARCHAR(50) DEFAULT 'programada',
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Historial_Medico (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT UNSIGNED,
    id_cita INT UNSIGNED,
    id_usuario INT UNSIGNED,
    fecha_visita TIMESTAMP NOT NULL,
    diagnostico VARCHAR(255),
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_clinica INT UNSIGNED,
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id),
    FOREIGN KEY (id_cita) REFERENCES Citas(id),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Procedimientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_historial_medico INT UNSIGNED,
    nombre_procedimiento VARCHAR(255),
    realizado_en TIMESTAMP,
    notas TEXT,
    id_clinica INT UNSIGNED,
    FOREIGN KEY (id_historial_medico) REFERENCES Historial_Medico(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Vacunaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT UNSIGNED,
    nombre_vacuna VARCHAR(255),
    fecha_vacuna DATE,
    dosis VARCHAR(50),
    id_historial_medico INT UNSIGNED,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_clinica INT UNSIGNED,
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id),
    FOREIGN KEY (id_historial_medico) REFERENCES Historial_Medico(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Tratamientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_historial_medico INT UNSIGNED,
    prescripto_por INT UNSIGNED,
    id_clinica INT UNSIGNED,
    fecha_prescripcion DATE,
    dosis VARCHAR(50),
    instrucciones TEXT,
    duracion_dias INT,
    notas TEXT,
    id_medicamento INT UNSIGNED,
    FOREIGN KEY (id_historial_medico) REFERENCES Historial_Medico(id),
    FOREIGN KEY (prescripto_por) REFERENCES Usuarios(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
    -- Nota: Agrega FOREIGN KEY para id_medicamento si defines tabla inventario_items
);

CREATE TABLE Inventario_Items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_clinica INT UNSIGNED,
    tipo VARCHAR(50),
    descripcion VARCHAR(255),
    cantidad_inicial INT,
    stock_minimo INT,
    fecha_expiracion DATE,
    proveedor VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);

CREATE TABLE Movimientos_Inventario (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_clinica INT UNSIGNED,
    realizado_por INT UNSIGNED,
    tipo_movimiento VARCHAR(50),
    cantidad INT,
    motivo VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_item INT UNSIGNED,
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id),
    FOREIGN KEY (realizado_por) REFERENCES Usuarios(id),
    FOREIGN KEY (id_item) REFERENCES Inventario_Items(id)
);

CREATE TABLE Registros_Auditoria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED,
    id_clinica INT UNSIGNED,
    accion VARCHAR(50),
    entidad VARCHAR(50),
    id_entidad INT UNSIGNED,
    detalles TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id)
);
