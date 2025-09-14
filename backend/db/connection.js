const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'www.teillier.cl',
  user: 'teillier_vetsync',
  password: '4SKdnVvDfYXrN2S24jSA',
  database: 'teillier_vetsync',
  port: 3306,
});

connection.connect(error => {
  if (error) {
    console.error('Error conectando a MySQL:', error);
    return;
  }
  console.log('Conectado a la base de datos MySQL en Docker.');
});

module.exports = connection;
