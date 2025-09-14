const connection = require('../../db/connection');

const eliminarUsuario = (req, res) => {
  const idUsuario = req.params.id;

  const query = 'DELETE FROM Usuarios WHERE id = ?';

  connection.query(query, [idUsuario], (error, results) => {
    if (error) {
      console.error('Error eliminando usuario:', error);
      return res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  });
};

module.exports = eliminarUsuario;
