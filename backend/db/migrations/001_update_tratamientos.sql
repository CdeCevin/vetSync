ALTER TABLE Tratamientos
ADD COLUMN id_paciente INT UNSIGNED AFTER id_historial_medico,
ADD COLUMN cantidad INT DEFAULT 1 AFTER dosis,
ADD CONSTRAINT fk_tratamientos_paciente FOREIGN KEY (id_paciente) REFERENCES Pacientes (id);