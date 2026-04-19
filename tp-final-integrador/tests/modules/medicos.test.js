import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Medicos - Integration Tests', () => {
  let adminToken;
  let pacienteToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    // Generamos tokens directamente (más rápido y robusto que login HTTP)
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
    pacienteToken = jwt.sign({ id: 5, rol: ROLES.PACIENTE, documento: '41000111' }, JWT_SECRET);
  });

  describe('GET /api/v1/medicos', () => {
    it('debería permitir a un paciente listar médicos', async () => {
      const response = await request(app)
        .get('/api/v1/medicos')
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería filtrar por especialidad', async () => {
      const response = await request(app)
        .get('/api/v1/medicos?especialidad=1')
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(response.status).toBe(200);
      // Todos los médicos en el resultado deberían ser de la especialidad 1 (PEDIATRÍA)
      // Nota: v_medicos tiene el nombre, no el ID, por eso el service filtra.
    });
  });

  describe('PUT /api/v1/medicos/:id/especialidad', () => {
    it('debería permitir al admin cambiar la especialidad', async () => {
      const response = await request(app)
        .put('/api/v1/medicos/1/especialidad')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_especialidad: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('correctamente');
    });

    it('debería denegar acceso si no es admin', async () => {
      const response = await request(app)
        .put('/api/v1/medicos/1/especialidad')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({ id_especialidad: 2 });

      expect(response.status).toBe(403);
    });

    it('debería retornar 422 si la especialidad no existe', async () => {
      const response = await request(app)
        .put('/api/v1/medicos/1/especialidad')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_especialidad: 999 });

      expect(response.status).toBe(422);
    });

    it('debería retornar 404 si el médico no existe', async () => {
      const response = await request(app)
        .put('/api/v1/medicos/999/especialidad')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_especialidad: 2 });

      expect(response.status).toBe(404);
    });
  });

  describe('Asociación de Obras Sociales (N:N)', () => {
    it('debería permitir al admin asociar una obra social a un médico', async () => {
      // Médico 1 no tiene la Obra Social 4 (OSUNER 3) en el seed
      const response = await request(app)
        .post('/api/v1/medicos/1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 4 });

      expect(response.status).toBe(201);
      expect(response.body.data.message).toContain('asociada correctamente');
    });

    it('debería fallar si la obra social ya está asociada y activa', async () => {
      // Médico 1 ya tiene la Obra Social 1 en el seed
      const response = await request(app)
        .post('/api/v1/medicos/1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 1 });

      expect(response.status).toBe(409);
    });

    it('debería permitir al admin desvincular una obra social (soft-delete)', async () => {
      const response = await request(app)
        .delete('/api/v1/medicos/1/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('desvinculada correctamente');
    });

    it('debería permitir re-asociar una obra social previamente desvinculada (reactivación)', async () => {
      // 1. Desvincular OS 1
      await request(app)
        .delete('/api/v1/medicos/1/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`);

      // 2. Re-asociar OS 1
      const response = await request(app)
        .post('/api/v1/medicos/1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 1 });

      expect(response.status).toBe(201);
      expect(response.body.data.message).toContain('asociada correctamente');
    });

    it('debería retornar 422 si la obra social no existe', async () => {
      const response = await request(app)
        .post('/api/v1/medicos/1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 999 });

      expect(response.status).toBe(422);
    });

    it('debería retornar 404 si el médico no existe al asociar', async () => {
      const response = await request(app)
        .post('/api/v1/medicos/999/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 1 });

      expect(response.status).toBe(404);
    });

    it('debería retornar 404 si el médico no existe al desvincular', async () => {
      const response = await request(app)
        .delete('/api/v1/medicos/999/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
