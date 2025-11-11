const pool = require('./connection');

async function queryConReintento(sql, params, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const [results] = await pool.promise().query(sql, params);
      return results;
    } catch (err) {
      if ((err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') && i < intentos - 1) {
        console.log(`Error de conexión detectado, reintentando... (${i + 1}/${intentos})`);
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      throw err;
    }
  }
}

module.exports = { queryConReintento };
