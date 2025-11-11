require('dotenv').config();
const mysql = require('mysql2');

console.log('Intentando conectar con:');
console.log('Host:', process.env.DB_HOST);
console.log('Password:', process.env.DB_PASSWORD);
console.log('Port:', process.env.DB_PORT || 3306);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectTimeout: 10000
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err.code, err.message);
    process.exit(1);
  }
  
  console.log('✅ Conexión exitosa');
  
  connection.query('SELECT 1 + 1 AS resultado', (error, results) => {
    if (error) {
      console.error('❌ Error en query:', error);
    } else {
      console.log('✅ Query exitosa:', results);
    }
    connection.end();
  });
});
