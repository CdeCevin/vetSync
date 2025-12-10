const { queryConReintento } = require('../../db/queryHelper');

const verTratamientos = async (req, res) => {
  const idClinica = req.clinicaId;
  try {
    const query = `
          SELECT 
            t.id,
            t.id_paciente,
            p.nombre AS paciente_nombre,
            p.especie AS paciente_especie,
            t.prescripto_por AS veterinario_id,
            u.nombre_completo AS veterinario_nombre,
            t.fecha_prescripcion,
            ii.nombre AS medicamento,
            t.dosis,
            t.instrucciones,
            t.duracion_dias,
            t.notas,
            t.estado,
            t.editado
          FROM Tratamientos t
          INNER JOIN Pacientes p ON t.id_paciente = p.id
          LEFT JOIN Usuarios u ON t.prescripto_por = u.id
          LEFT JOIN Inventario_Items ii ON t.id_medicamento = ii.id
          WHERE t.id_clinica = ? AND t.estado != 'Cancelado'
          ORDER BY t.fecha_prescripcion DESC, t.id DESC
          LIMIT 50
        `;

    const results = await queryConReintento(query, [idClinica]);

    // Formatear respuesta
    const formateados = results.map(r => ({
      id: r.id,
      pacienteId: r.id_paciente,
      pacienteNombre: `${r.paciente_nombre} (${r.paciente_especie || 'Desconocido'})`,
      veterinarioId: r.veterinario_id,
      veterinarioNombre: r.veterinario_nombre || 'Desconocido',
      fechaPrescripcion: r.fecha_prescripcion,
      medicamento: r.medicamento || 'Sin medicamento',
      dosis: r.dosis,
      instrucciones: r.instrucciones,
      duracionDias: r.duracion_dias,
      notas: r.notas,
      estado: r.estado,
      editado: !!r.editado
    }));

    res.json(formateados);

  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    res.status(500).json({ error: 'Error interno al obtener los tratamientos' });
  }
};

module.exports = verTratamientos;
