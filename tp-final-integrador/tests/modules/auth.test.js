import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { setupTestDB } from '../setup/db.js';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  describe('POST /api/v1/auth/login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ferben@correo.com',
        contrasenia: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('ferben@correo.com');
    });

    it('debería fallar con credenciales incorrectas', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ferben@correo.com',
        contrasenia: 'wrong',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debería fallar con datos de entrada inválidos (express-validator)', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'not-an-email',
        contrasenia: '',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
