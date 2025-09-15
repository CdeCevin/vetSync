const connection = require('../../db/connection');

const editarDueno = (req, res) => {
  const idDueno = req.params.id;
  const idClinica = req.clinicaId; // obtenido de prefijo ruta o middleware
  const {
    nombre,
    telefono,
    correo,
    direccion
  } = req.body;

  // Paso 1: Obtener datos actuales filtrando por clínica y activo
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

      // Paso 2: Combinar valores (si no se envían, mantener actuales)
      const nuevoNombre = nombre !== undefined ? nombre : duenoActual.nombre;
      const nuevoTelefono = telefono !== undefined ? telefono : duenoActual.telefono;
      const nuevoCorreo = correo !== undefined ? correo : duenoActual.correo;
      const nuevaDireccion = direccion !== undefined ? direccion : duenoActual.direccion;

      // Paso 3: Actualizar dueño con filtro por clínica y activo
      const query = `
        UPDATE Dueños 
        SET nombre = ?, telefono = ?, correo = ?, direccion = ?
        WHERE id = ? AND id_clinica = ? AND activo = TRUE
      `;

      connection.query(
        query,
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
  );
};

module.exports = editarDueno;
