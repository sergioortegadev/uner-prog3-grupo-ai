import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import * as healthModel from '../../src/modules/health/health.model.js';

vi.mock('../../src/modules/health/health.model.js', () => ({
  getDatabaseVersion: vi.fn(),
  getMaxConnections: vi.fn(),
  getActiveConnections: vi.fn(),
}));

describe('Health Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('debería retornar 200 OK y el éxito de la conexión', async () => {
      healthModel.getDatabaseVersion.mockResolvedValue('8.0.32');
      healthModel.getMaxConnections.mockResolvedValue(151);
      healthModel.getActiveConnections.mockResolvedValue(5);

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.database.status).toBe('conectado');
    });

    it('debería retornar 503 cuando la base de datos falla', async () => {
      healthModel.getDatabaseVersion.mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DATABASE_ERROR');
    });
  });
});
