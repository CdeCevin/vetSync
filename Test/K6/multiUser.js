// Test/k6/multiusuario-clinicas.js  
import http from 'k6/http';  
import { check, sleep } from 'k6';  
import { SharedArray } from 'k6/data';  
  
// Configuración de usuarios por clínica  
const usuarios = new SharedArray('usuarios', function () {  
  return [  
    // Clínica 1  
    { correo: 'admin1@clinica1.com', password: '12345', idClinica: 1 },  //list
    { correo: 'vet1@clinica1.com', password: '12345', idClinica: 1 },  
    { correo: 'recep@clinica1.com', password: '12345', idClinica: 1 },  
      
    // Clínica 4  
    { correo: 'admin4@clinica4.com', password: '12345', idClinica: 4 },  //listo
    { correo: 'vet4@clinica4.com', password: '12345', idClinica: 4 },  
    { correo: 'recep4@clinica4.com', password: '12345', idClinica: 4 },  

    // Clínica 6  
    { correo: 'admin2@clinica2.com', password: '12345', idClinica: 6 },  //listo
    { correo: 'vet2@clinica2.com', password: '12345', idClinica: 6 },  
    { correo: 'recep2@clinica2.com', password: '12345', idClinica: 6 },  
      
    // Clínica 7 
    { correo: 'admin7@clinica7.com', password: '12345', idClinica: 7 },  
    { correo: 'vet7@clinica7.com', password: '12345', idClinica: 7 },  
    { correo: 'recep7@clinica7.com', password: '12345', idClinica: 7 },  

    // Clínica 8  
    { correo: 'admin8@clinica8.com', password: '12345', idClinica: 8 },  
    { correo: 'vet8@clinica8.com', password: '12345', idClinica: 8 },  
    { correo: 'recep8@clinica8.com', password: '12345', idClinica: 8 },  
      
    // Clínica 9  
    { correo: 'admin9@clinica9.com', password: '12345', idClinica: 9 },  
    { correo: 'vet9@clinica9.com', password: '12345', idClinica: 9 },  
    { correo: 'recep9@clinica9.com', password: '12345', idClinica: 9 },  

  ];  
});  
  
// Configuración de la prueba  
export const options = {  
  vus: 18, // 18 usuarios virtuales simultáneos  
  duration: '5m', // Duración de la prueba: 5 minutos  
  thresholds: {  
    http_req_duration: ['p(95)<500'], // 95% de requests deben responder en menos de 500ms  
    http_req_failed: ['rate<0.01'], // Menos del 1% de requests pueden fallar  
  },  
};  
  
const BASE_URL = 'http://localhost:3001/api';  
  
export default function () {  
  // Cada VU (Virtual User) usa un usuario diferente  
  const usuario = usuarios[__VU - 1]; // __VU es el índice del usuario virtual (1-18)  
    
  // 1. Login para obtener JWT  
  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({  
    correo_electronico: usuario.correo,  
    contraseña: usuario.password,  
  }), {  
    headers: { 'Content-Type': 'application/json' },  
  });  
  
  check(loginRes, {  
    'login exitoso': (r) => r.status === 200,  
    'token recibido': (r) => r.json('token') !== undefined,  
  });  
  
  if (loginRes.status !== 200) {  
    console.error(`Login falló para ${usuario.correo}`);  
    return;  
  }  
  
  const token = loginRes.json('token');  
  const authHeaders = {  
    'Authorization': `Bearer ${token}`,  
    'Content-Type': 'application/json',  
  };  
  
  sleep(1); // Pausa de 1 segundo entre operaciones  
  
  // 2. Ver listado de usuarios de su clínica  
  const usuariosRes = http.get(  
    `${BASE_URL}/${usuario.idClinica}/usuarios`,  
    { headers: authHeaders }  
  );  
  
  check(usuariosRes, {  
    'listado usuarios exitoso': (r) => r.status === 200,  
    'usuarios es array': (r) => Array.isArray(r.json()),  
    'usuarios de la clínica correcta': (r) => {  
      const users = r.json();  
      return users.length === 0 || users.every(u => u.id_clinica === usuario.idClinica);  
    },  
  });  
  
  sleep(2); // Pausa de 2 segundos  
  
  // 3. Ver listado de citas de su clínica  
  const citasRes = http.get(  
    `${BASE_URL}/${usuario.idClinica}/Citas`,  
    { headers: authHeaders }  
  );  
  
  check(citasRes, {  
    'listado citas exitoso': (r) => r.status === 200,  
    'citas es array': (r) => Array.isArray(r.json()),  
    'citas de la clínica correcta': (r) => {  
      const citas = r.json();  
      return citas.length === 0 || citas.every(c => c.id_clinica === usuario.idClinica);  
    },  
  });  
  
  sleep(2); // Pausa de 2 segundos antes de la siguiente iteración  
}