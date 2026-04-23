import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Pacientes - Integration Tests', () => {
  let adminToken;
  let pacienteToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    await setupTestDB();

    // Generamos tokens directamente (más rápido y robusto que login HTTP)
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
    pacienteToken = jwt.sign({ id: 5, rol: ROLES.PACIENTE, documento: '41000111' }, JWT_SECRET);
  });

  describe('PUT /api/v1/pacientes/:id/obra-social', () => {
    it('debería permitir al admin cambiar la obra social del paciente', async () => {
      const response = await request(app)
        .put('/api/v1/pacientes/1/obra-social')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('correctamente');
    });

    it('debería fallar si la obra social no existe', async () => {
      const response = await request(app)
        .put('/api/v1/pacientes/1/obra-social')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 999 });

      expect(response.status).toBe(422);
    });

    it('debería retornar 404 si el paciente no existe', async () => {
      const response = await request(app)
        .put('/api/v1/pacientes/999/obra-social')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ id_obra_social: 2 });

      expect(response.status).toBe(404);
    });

    it('debería denegar acceso si no es admin', async () => {
      const response = await request(app)
        .put('/api/v1/pacientes/1/obra-social')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({ id_obra_social: 2 });

      expect(response.status).toBe(403);
    });
  });
});
