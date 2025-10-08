const connection = require('../../db/connection');

const editarDueno = (req, res) => {
  const idDueno = req.params.id;
  const idClinica = req.clinicaId;
  const {
    nombre,
    telefono,
    correo,
    direccion
  } = req.body;

  // Paso 1: Obtener dueño actual
  connection.query(
    'SELECT * FROM Dueños WHERE id = ? AND id_clinica = ? AND activo = TRUE',
    [idDueno, idClinica],
    (err, results) => {
      if (err) {
        console.error('Error buscando dueño:', err);
        return res.status(500).json({ error: 'Error al buscar dueño' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Dueño no encontrado o no pertenece a esta clínica' });
      }

      const duenoActual = results[0];

      // Validar que correo no esté en otro dueño (excepto este)
      if (correo && correo !== duenoActual.correo) {
        const queryValidarCorreo = `
          SELECT COUNT(*) AS count FROM Dueños 
          WHERE correo = ? AND id_clinica = ? AND activo = TRUE AND id != ?
        `;
        connection.query(queryValidarCorreo, [correo, idClinica, idDueno], (err2, res2) => {
          if (err2) {
            console.error('Error validando correo:', err2);
            return res.status(500).json({ error: 'Error validando correo electrónico' });
          }
          if (res2[0].count > 0) {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado en otro dueño' });
          }
          // Continúa actualización
          actualizarDatos();
        });
      } else {
        actualizarDatos();
      }

      function actualizarDatos() {
        const nuevoNombre = nombre !== undefined ? nombre : duenoActual.nombre;
        const nuevoTelefono = telefono !== undefined ? telefono : duenoActual.telefono;
        const nuevoCorreo = correo !== undefined ? correo : duenoActual.correo;
        const nuevaDireccion = direccion !== undefined ? direccion : duenoActual.direccion;

        const queryUpdate = `
          UPDATE Dueños 
          SET nombre = ?, telefono = ?, correo = ?, direccion = ?
          WHERE id = ? AND id_clinica = ? AND activo = TRUE
        `;

        connection.query(
          queryUpdate,
          [nuevoNombre, nuevoTelefono, nuevoCorreo, nuevaDireccion, idDueno, idClinica],
          (error) => {
            if (error) {
              console.error('Error actualizando dueño:', error);
              return res.status(500).json({ error: 'Error al actualizar dueño' });
            }
            res.json({ message: 'Dueño actualizado correctamente' });
          }
        );
      }
    }
  );
};

module.exports = editarDueno;
