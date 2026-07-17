import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.ts';
import { setupTestDB } from '../setup/db.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';
import apicache from 'apicache';

describe('Cache Integration Tests', () => {
  let adminToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    process.env.ENABLE_CACHE = 'true';
    apicache.clear(); // Limpiamos cache global entre tests
    await setupTestDB();
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
  });

  afterAll(() => {
    delete process.env.ENABLE_CACHE;
  });

  it('debería guardar la respuesta en el cache en la primera petición GET', async () => {
    // Verificamos que el índice está vacío al inicio
    apicache.clear();
    expect(Object.keys(apicache.getIndex().all).length).toBe(0);

    // Primera petición (MISS)
    await request(app).get('/api/v1/obras-sociales').set('Authorization', `Bearer ${adminToken}`);

    // Damos un respiro para que apicache guarde (es asíncrono al res.end)
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verificamos que ahora hay una entrada en el cache
    const index = apicache.getIndex();
    expect(Object.keys(index.all).length).toBeGreaterThan(0);
  });

  it('debería invalidar el cache después de un POST', async () => {
    // 1. Llenamos cache
    await request(app).get('/api/v1/obras-sociales').set('Authorization', `Bearer ${adminToken}`);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(Object.keys(apicache.getIndex().all).length).toBeGreaterThan(0);

    // 2. Creamos nueva obra social (debería limpiar cache)
    await request(app)
      .post('/api/v1/obras-sociales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Nueva OS Cache Inval',
        descripcion: 'Test cache invalidation',
        porcentajeDescuento: 0.1,
        esParticular: false,
      });

    // 3. El índice de cache para el grupo 'obras-sociales' debería estar vacío
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(Object.keys(apicache.getIndex().all).length).toBe(0);
  });
});
