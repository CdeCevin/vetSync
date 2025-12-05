const { queryConReintento } = require('../../db/queryHelper');
const logAuditoria = require('../../utils/auditLogger');
const getDiff = require('../../utils/diffHelper');

const editarDueno = async (req, res) => {
  try {
    const idDueno = req.params.id;
    const idClinica = req.clinicaId;
    const { nombre, telefono, correo, direccion } = req.body;

    const results = await queryConReintento(
      'SELECT * FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE',
      [idDueno, idClinica]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Dueño no encontrado o no pertenece a esta clínica' });
    }

    const duenoActual = results[0];

    if (correo && correo !== duenoActual.correo) {
      const queryValidarCorreo = `
        SELECT COUNT(*) AS count FROM Dueños 
        WHERE correo = ? AND id_clinica = ? AND activo = TRUE AND id != ?
      `;
      const res2 = await queryConReintento(queryValidarCorreo, [correo, idClinica, idDueno]);

      if (res2[0].count > 0) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado en otro dueño' });
      }
    }

    const nuevoNombre = nombre !== undefined ? nombre : duenoActual.nombre;
    const nuevoTelefono = telefono !== undefined ? telefono : duenoActual.telefono;
    const nuevoCorreo = correo !== undefined ? correo : duenoActual.correo;
    const nuevaDireccion = direccion !== undefined ? direccion : duenoActual.direccion;

    const queryUpdate = `
      UPDATE Dueños 
      SET nombre = ?, telefono = ?, correo = ?, direccion = ?
      WHERE id = ? AND id_clinica = ? AND activo = TRUE
    `;

    await queryConReintento(
      queryUpdate,
      [nuevoNombre, nuevoTelefono, nuevoCorreo, nuevaDireccion, idDueno, idClinica]
    );

    // Audit Log con Diff
    const updates = {
      nombre: nuevoNombre,
      telefono: nuevoTelefono,
      correo: nuevoCorreo,
      direccion: nuevaDireccion
    };
    const cambios = getDiff(duenoActual, updates);

    await logAuditoria({
      id_usuario: req.usuario.id,
      id_clinica: idClinica,
      accion: 'MODIFICAR',
      entidad: 'Dueño',
      id_entidad: idDueno,
      detalles: cambios ? JSON.stringify(cambios) : 'Actualización de dueño (sin cambios detectados)'
    });

    res.json({ message: 'Dueño actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando dueño:', error);
    res.status(500).json({ error: 'Error al actualizar dueño' });
  }
};

module.exports = editarDueno;
