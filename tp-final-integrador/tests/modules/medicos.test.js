import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';

describe('Médicos - Integration Tests', () => {
  let medicoId;
  let osActivaId1;
  let osActivaId2;
  let osInactivaId;

  beforeEach(async () => {
    await setupTestDB();

    // 1. Crear Especialidad
    const [espResult] = await pool.execute(
      'INSERT INTO especialidades (nombre, activo) VALUES (?, 1)',
      ['PEDIATRÍA'],
    );
    const espId = espResult.insertId;

    // 2. Crear Usuario Médico
    const [userResult] = await pool.execute(
      'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['12345678', 'Gomez', 'Juan', 'juan.gomez@test.com', 'hash', '', 1, 1],
    );
    const userId = userResult.insertId;

    // 3. Crear Médico
    const [medicoResult] = await pool.execute(
      'INSERT INTO medicos (id_usuario, id_especialidad, matricula, descripcion, valor_consulta) VALUES (?, ?, ?, ?, ?)',
      [userId, espId, 5555, 'Test description', 5000.0],
    );
    medicoId = medicoResult.insertId;

    // 4. Crear Obras Sociales
    const [os1] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
      ['OS 1', 'Desc 1', 10, 0, 1],
    );
    osActivaId1 = os1.insertId;

    const [os2] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
      ['OS 2', 'Desc 2', 15, 0, 1],
    );
    osActivaId2 = os2.insertId;

    const [os3] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
      ['OS 3', 'Desc 3', 5, 0, 0],
    );
    osInactivaId = os3.insertId;
  });

  describe('POST /api/v1/medicos/:id_medico/obras-sociales', () => {
    it('debería asociar múltiples obras sociales exitosamente (201)', async () => {
      const response = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .send({ obrasSociales: [osActivaId1, osActivaId2] });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute(
        'SELECT * FROM medicos_obras_sociales WHERE id_medico = ?',
        [medicoId],
      );
      expect(rows).toHaveLength(2);
      const ids = rows.map((r) => r.id_obra_social);
      expect(ids).toContain(osActivaId1);
      expect(ids).toContain(osActivaId2);
    });

    it('debería ser idempotente si ya existe una asociación (201/200)', async () => {
      // Pre-asociar OS 1
      await pool.execute(
        'INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, 1)',
        [medicoId, osActivaId1],
      );

      const response = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .send({ obrasSociales: [osActivaId1, osActivaId2] });

      expect(response.status).toBe(201);

      const [rows] = await pool.execute(
        'SELECT * FROM medicos_obras_sociales WHERE id_medico = ?',
        [medicoId],
      );
      expect(rows).toHaveLength(2); // No debe haber duplicados
    });

    it('debería retornar 404 si el médico no existe', async () => {
      const response = await request(app)
        .post('/api/v1/medicos/999/obras-sociales')
        .send({ obrasSociales: [osActivaId1] });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si alguna obra social no existe o está inactiva', async () => {
      const response = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .send({ obrasSociales: [osActivaId1, osInactivaId] });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);

      // Verificar que no se insertó ninguna (rollback)
      const [rows] = await pool.execute(
        'SELECT * FROM medicos_obras_sociales WHERE id_medico = ?',
        [medicoId],
      );
      expect(rows).toHaveLength(0);
    });

    it('debería retornar 422 si el body es inválido (no es array)', async () => {
      const response = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .send({ obrasSociales: osActivaId1 }); // No es array

      expect(response.status).toBe(422);
    });

    it('debería retornar 422 si el array está vacío', async () => {
      const response = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .send({ obrasSociales: [] });

      expect(response.status).toBe(422);
    });
  });

  describe('Métodos No Permitidos (405)', () => {
    it('debería retornar 405 para métodos no soportados en /:id_medico/obras-sociales', async () => {
      const response = await request(app).get(`/api/v1/medicos/${medicoId}/obras-sociales`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'POST');
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});
