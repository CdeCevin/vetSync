const request = require('supertest');
const app = require('../../backend/server');


describe('API Tests - vetSync', () => {
  let authToken;
  let idClinica;

  // 1. Login como recepcionista
  describe('POST /api/login', () => {
    it('debe autenticar recepcionista y obtener JWT', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          correo_electronico: 're@ce.com',
          contraseña: '12345'  
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario).toHaveProperty('id_clinica');
      expect(res.body.usuario.id_rol).toBe(3); // Rol recepcionista

      // Guardar token y id_clinica para las siguientes pruebas
      authToken = res.body.token;
      idClinica = res.body.usuario.id_clinica;
    });
  });

  // 2. Listado de dueños
  describe('GET /api/:idClinica/duenos', () => {
    it('debe listar todos los dueños de la clínica', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/duenos`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar estructura de cada dueño
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('nombre');
        expect(res.body[0]).toHaveProperty('telefono');
        expect(res.body[0]).toHaveProperty('correo');
        expect(res.body[0]).toHaveProperty('direccion');
      }
    });

    it('debe rechazar sin token de autenticación', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/duenos`);

      expect(res.statusCode).toBe(401);

    });
  });

  // 3. Listado de pacientes
  describe('GET /api/:idClinica/Pacientes/buscar', () => {
    it('debe listar todos los pacientes de la clínica', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/Pacientes/buscar?q=`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar estructura de cada paciente
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('nombre');
        expect(res.body[0]).toHaveProperty('raza');
        expect(res.body[0]).toHaveProperty('dueno');
        expect(res.body[0].dueno).toHaveProperty('nombre');
      }
    });

    it('debe filtrar pacientes por nombre', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/Pacientes/buscar?q=Manchitas`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // 4. Listado de citas
  describe('GET /api/:idClinica/Citas', () => {
    it('debe listar todas las citas de la clínica', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/Citas`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verificar estructura de cada cita
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('id_paciente');
        expect(res.body[0]).toHaveProperty('id_usuario');
        expect(res.body[0]).toHaveProperty('fecha_cita');
        expect(res.body[0]).toHaveProperty('motivo');
        expect(res.body[0]).toHaveProperty('tipo_cita');
        expect(res.body[0]).toHaveProperty('estado');
        expect(res.body[0]).toHaveProperty('nombre_paciente');
        expect(res.body[0]).toHaveProperty('nombre_usuario');
      }
    });

    it('debe rechazar con token inválido', async () => {
      const res = await request(app)
        .get(`/api/${idClinica}/Citas`)
        .set('Authorization', 'Bearer token_invalido');

      expect(res.statusCode).toBe(401); // 'Token inválido o expirado');
                
    });

    it('debe rechazar acceso a otra clínica', async () => {
      const otraClinica = idClinica + 99; // Usar un ID que seguro no sea el mismo
      const res = await request(app)
        .get(`/api/${otraClinica}/Citas`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403); 
    });
  });
});