const mysql = require('mysql2');

let pool;

function crearPool() {
  pool = mysql.createPool({
    host: 'www.teillier.cl',
    user: 'teillier_vetsync',
    password: '4SKdnVvDfYXrN2S24jSA',
    database: 'teillier_vetsync',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  // Escuchar errores del pool
  pool.on('error', (err) => {
    console.error('MySQL Pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('Reconectando pool...');
      // Recrear pool para intentar reconexión
      crearPool();
    } else {
      throw err;
    }
  });

  // Ping cada 30 seg para mantener vivo el pool
  setInterval(() => {
    pool.query('SELECT 1', (err) => {
      if (err) {
        console.error('Error en ping DB:', err);
      } else {       
      }
    });
  }, 30000);

  return pool;
}

module.exports = crearPool();
