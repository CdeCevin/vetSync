const mysql = require('mysql2');

let pool;

function crearPool() {
  if (pool) {
    return pool;
  }

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
    keepAliveInitialDelay: 0,   
    dateStrings: true
  });

  pool.on('error', (err) => {
    console.error('Error inesperado en el Pool de MySQL:', err.code, err.message);
  });

  // Ping a la base de datos cada 30 segundos para mantener la conexión activa
  setInterval(() => {
    pool.query('SELECT 1', (err) => {
      if (err) {
        console.error('Error en el heartbeat de la DB:', err.message);
      }
    });
  }, 30000); 

  console.log("Pool de MySQL creado y listo (con heartbeat activo).");
  return pool;
}

module.exports = crearPool();