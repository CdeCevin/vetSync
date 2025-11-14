//require('dotenv').config(); 
const mysql = require('mysql2');

let pool;

function crearPool() {
  if (pool) {
    return pool;
  }

  // Validar variables de entorno
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Error: Faltan variables de entorno críticas para la base de datos.');
    process.exit(1); 
  }

  pool = mysql.createPool({
    // Credenciales desde .env
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    // Configuración del Pool
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    maxIdle: 10,
    idleTimeout: 60000,
    
    // KeepAlive y Timeouts válidos para conexiones
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 20000,
    dateStrings: true
  });

  // Manejador de errores del pool
  pool.on('error', (err) => {
    console.error('Error inesperado en el Pool de MySQL:', err.code, err.message);
  });

  // Heartbeat para mantener conexiones activas
  setInterval(() => {
    if (pool) { 
      pool.query('SELECT 1', (err) => {
        if (err) {
          console.error('Error en el heartbeat de la DB:', err.message);
        }
      });
    }
  }, 30000); 
  
  console.log("Pool de MySQL creado y listo (con heartbeat activo).");
  return pool;
}

module.exports = crearPool();
