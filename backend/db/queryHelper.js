const pool = require('./connection');

function queryConReintento(sql, params, intentos = 3) {
  return new Promise((resolve, reject) => {

    const intentarQuery = (n) => {
      pool.query(sql, params, (err, results) => {
        if (err) {
          if ((err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') && n < intentos - 1) {
            console.log(`Error de conexión detectado, reintentando... (${n + 1}/${intentos})`);
            setTimeout(() => intentarQuery(n + 1), 200);
          } else {
            console.error("Error final en queryConReintento:", err);
            reject(err);
          }
        } else {
          resolve(results);
        }
      });
    };

    intentarQuery(0);
  });
}

module.exports = { queryConReintento };
