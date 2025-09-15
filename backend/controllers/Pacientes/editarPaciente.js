const connection = require('../../db/connection');

const editarPaciente = (req, res) => {
  const idPaciente = req.params.id;
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

  // Paso 1: Obtener paciente actual
  const selectQuery = 'SELECT * FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE';
  connection.query(selectQuery, [idPaciente, idClinica], (err, results) => {
    if (err) {
      console.error('Error buscando paciente:', err);
      return res.status(500).json({ error: 'Error al buscar paciente' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado o no pertenece a esta clínica' });
    }

    const pacienteActual = results[0];

    // Paso 2: Combinar valores con fallback a los actuales
    const nuevoNombre = nombre !== undefined ? nombre : pacienteActual.nombre;
    const nuevaEspecie = especie !== undefined ? especie : pacienteActual.especie;
    const nuevaRaza = raza !== undefined ? raza : pacienteActual.raza;
    const nuevoColor = color !== undefined ? color : pacienteActual.color;
    const nuevaEdad = edad !== undefined ? edad : pacienteActual.edad;
    const nuevoPeso = peso !== undefined ? peso : pacienteActual.peso;
    const nuevoMicrochip = numero_microchip !== undefined ? numero_microchip : pacienteActual.numero_microchip;
    const nuevoIdDueno = id_dueño !== undefined ? id_dueño : pacienteActual.id_dueño;

    // Paso 3: Ejecutar actualización
    const updateQuery = `
      UPDATE Pacientes
      SET nombre = ?, especie = ?, raza = ?, color = ?, edad = ?, peso = ?, numero_microchip = ?, id_dueño = ?
      WHERE id = ? AND id_clinica = ?
    `;

    connection.query(
      updateQuery,
      [nuevoNombre, nuevaEspecie, nuevaRaza, nuevoColor, nuevaEdad, nuevoPeso, nuevoMicrochip, nuevoIdDueno, idPaciente, idClinica],
      (updateErr) => {
        if (updateErr) {
          console.error('Error actualizando paciente:', updateErr);
          return res.status(500).json({ error: 'Error al actualizar paciente' });
        }
        res.json({ message: 'Paciente actualizado correctamente' });
      }
    );
  });
};

module.exports = editarPaciente;
