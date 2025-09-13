const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'passwd',
  database: 'vetSyncDB',
  port: 3306,
});

connection.connect(error => {
  if (error) {
    console.error('Error conectando a MySQL:', error);
    return;
  }
  console.log('Conectado a la base de datos MySQL en Docker.');
});

const getClinicas = (req, res) => {
  const query = 'SELECT * FROM Clinicas';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener las clínicas:', error);
      return res.status(500).json({ error: 'Error al obtener las clínicas' });
    }
    res.json(results);
  });
};

app.get('/', (req, res) => {
  res.send('Hola desde el backend con CommonJS!');
});

app.get('/clinicas', getClinicas);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
