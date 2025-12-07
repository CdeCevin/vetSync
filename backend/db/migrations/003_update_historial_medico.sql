ALTER TABLE Historial_Medico
ADD COLUMN peso DECIMAL(5, 2) AFTER fecha_visita,
ADD COLUMN temperatura DECIMAL(4, 1) AFTER peso,
ADD COLUMN frecuencia_cardiaca INT AFTER temperatura,
ADD COLUMN frecuencia_respiratoria INT AFTER frecuencia_cardiaca,
MODIFY COLUMN diagnostico TEXT;