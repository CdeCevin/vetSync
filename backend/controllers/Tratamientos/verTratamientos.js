const connection = require('../../db/connection');

const verTratamientos = (req, res) => {
  const idClinica = req.clinicaId;
  const idPaciente = req.params.idPaciente;

  console.log('Ver tratamientos - idClinica:', idClinica, 'idPaciente:', idPaciente);

  // Consulta para obtener tratamientos con detalle incluyendo medicamento
  const queryTratamientos = `
    SELECT 
      p.nombre AS paciente,
      hm.fecha_visita,
      hm.diagnostico,
      t.fecha_prescripcion,
      t.dosis,
      t.instrucciones,
      t.notas AS notas_tratamiento,
      ii.descripcion AS medicamento
    FROM Pacientes p
    INNER JOIN Historial_Medico hm ON hm.id_paciente = p.id AND hm.id_clinica = ?
    LEFT JOIN Tratamientos t ON t.id_historial_medico = hm.id AND t.id_clinica = ?
    LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id AND ii.id_clinica = ?
    WHERE p.id = ? AND p.id_clinica = ? AND p.activo = TRUE
    ORDER BY hm.fecha_visita DESC, t.fecha_prescripcion DESC;
  `;

  connection.query(queryTratamientos, [idClinica, idClinica, idClinica, idPaciente, idClinica], (err, results) => {
    if (err) {
      console.error('Error buscando tratamientos:', err);
      return res.status(500).json({ error: 'Error al buscar tratamientos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron tratamientos para este paciente en esta clínica' });
    }

    // Construir respuesta agrupando tratamientos por fecha visita y detalle paciente
    // Opcionalmente, simplificar la estructura para frontend
    
    res.json(results);
  });
};

module.exports = verTratamientos;
