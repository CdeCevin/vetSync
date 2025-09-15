const connection = require('../../db/connection');

const crearPaciente = (req, res) => {
  const idClinica = req.clinicaId;
  const {
    nombre,
    especie,
    raza,
    color,
    edad,
    peso,
    numero_microchip,
    id_dueño
  } = req.body;

  if (!nombre || !id_dueño || !idClinica) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (nombre, id_dueño, id_clinica)' });
  }

  // Verificar si el dueño existe y está activo
  const queryDueno = `
    SELECT id FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE
  `;
  connection.query(queryDueno, [id_dueño, idClinica], (err, results) => {
    if (err) {
      console.error('Error verificando dueño:', err);
      return res.status(500).json({ error: 'Error verificando dueño' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'El dueño indicado no existe o no está activo' });
    }
    // Si existe el dueño, crear el paciente
    const queryPaciente = `
      INSERT INTO Pacientes (nombre, especie, raza, color, edad, peso, numero_microchip, id_dueño, id_clinica)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(
      queryPaciente,
      [nombre, especie, raza, color, edad, peso, numero_microchip, id_dueño, idClinica],
      (error, results) => {
        if (error) {
          console.error('Error creando paciente:', error);
          return res.status(500).json({ error: 'Error al crear paciente' });
        }
        res.status(201).json({ message: 'Paciente creado correctamente', id: results.insertId });
      }
    );
  });
};

module.exports = crearPaciente;
