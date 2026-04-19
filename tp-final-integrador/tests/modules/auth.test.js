import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ferben@correo.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('ferben@correo.com');
    });

    it('debería fallar con credenciales incorrectas', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ferben@correo.com',
        password: 'wrong',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debería fallar con datos de entrada inválidos (express-validator)', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'not-an-email',
        password: '',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('debería ser case-sensitive con la contraseña', async () => {
      // Intentamos con la password en MAYÚSCULAS (debe fallar 401)
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ferben@correo.com',
        password: 'PASSWORD123', // Original es password123
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Credenciales inválidas');
    });
  });
});
