const { queryConReintento } = require('../../db/queryHelper');

const editarPaciente = async (req, res) => {
  try {
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

    const selectQuery = 'SELECT * FROM Pacientes WHERE id = ? AND id_clinica = ? AND activo = TRUE';
    const results = await queryConReintento(selectQuery, [idPaciente, idClinica]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado o no pertenece a esta clínica' });
    }

    const pacienteActual = results[0];

    const nuevoNombre = nombre !== undefined ? nombre : pacienteActual.nombre;
    const nuevaEspecie = especie !== undefined ? especie : pacienteActual.especie;
    const nuevaRaza = raza !== undefined ? raza : pacienteActual.raza;
    const nuevoColor = color !== undefined ? color : pacienteActual.color;
    const nuevaEdad = edad !== undefined ? edad : pacienteActual.edad;
    const nuevoPeso = peso !== undefined ? peso : pacienteActual.peso;
    const nuevoMicrochip = numero_microchip !== undefined ? numero_microchip : pacienteActual.numero_microchip;
    const nuevoIdDueno = id_dueño !== undefined ? id_dueño : pacienteActual.id_dueño;

    const updateQuery = `
      UPDATE Pacientes
      SET nombre = ?, especie = ?, raza = ?, color = ?, edad = ?, peso = ?, numero_microchip = ?, id_dueño = ?
      WHERE id = ? AND id_clinica = ?
    `;

    await queryConReintento(
      updateQuery,
      [nuevoNombre, nuevaEspecie, nuevaRaza, nuevoColor, nuevaEdad, nuevoPeso, nuevoMicrochip, nuevoIdDueno, idPaciente, idClinica]
    );

    res.json({ message: 'Paciente actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
};

module.exports = editarPaciente;
