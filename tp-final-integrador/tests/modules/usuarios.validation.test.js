import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { setupTestDB } from '../setup/db.js';

describe('Usuarios Validation Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    await setupTestDB();

    // Iniciar sesión como administrador para obtener el token
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'ferben@correo.com',
      contrasenia: 'password123',
    });
    adminToken = loginResponse.body.data.token;
  });

  describe('PUT /api/v1/usuarios/:idUsuario', () => {
    it('debería fallar si el rol es inválido', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rol: 99, // Rol inexistente
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');

      const rolError = response.body.error.details.find((err) => err.path === 'rol');
      expect(rolError).toBeDefined();
      expect(rolError.msg).toContain('El rol debe ser uno de los siguientes');
    });

    it('debería fallar si el email es inválido', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'not-an-email',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');

      const emailError = response.body.error.details.find((err) => err.path === 'email');
      expect(emailError).toBeDefined();
      expect(emailError.msg).toBe('Debe ser un email válido');
    });

    it('debería fallar si el documento excede los 20 caracteres', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          documento: '123456789012345678901', // 21 caracteres
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      const docError = response.body.error.details.find((err) => err.path === 'documento');
      expect(docError).toBeDefined();
      expect(docError.msg).toBe('El documento debe tener entre 1 y 20 caracteres');
    });

    it('debería fallar si la contraseña tiene menos de 6 caracteres', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contrasenia: '12345',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      const passError = response.body.error.details.find((err) => err.path === 'contrasenia');
      expect(passError).toBeDefined();
      expect(passError.msg).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('debería funcionar con un documento válido de 20 caracteres', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          documento: 'A1234567890123456789', // 20 caracteres alfanuméricos
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
    });

    it('debería funcionar con un rol válido', async () => {
      const response = await request(app)
        .put('/api/v1/usuarios/8')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rol: 3, // Sigue siendo Admin
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rol).toBe(3);
    });
  });

  describe('POST /api/v1/usuarios/admin', () => {
    it('debería fallar al crear un usuario con contraseña de menos de 6 caracteres', async () => {
      const response = await request(app)
        .post('/api/v1/usuarios/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          documento: '11223344',
          apellido: 'Test',
          nombres: 'Validation',
          email: 'testval@correo.com',
          contrasenia: '12345',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      const passError = response.body.error.details.find((err) => err.path === 'contrasenia');
      expect(passError).toBeDefined();
      expect(passError.msg).toBe('La contraseña debe tener al menos 6 caracteres');
    });
  });
});
