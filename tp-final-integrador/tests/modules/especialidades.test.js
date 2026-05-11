import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Especialidades - Integration Tests', () => {
  let adminToken;
  let pacienteToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    await setupTestDB();
    // Generamos tokens para las pruebas
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
    pacienteToken = jwt.sign({ id: 5, rol: ROLES.PACIENTE, documento: '41000111' }, JWT_SECRET);
  });

  describe('Seguridad y Autorización', () => {
    it('debería permitir a un Paciente listar especialidades', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades')
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debería retornar 403 si un Paciente intenta crear una especialidad', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${pacienteToken}`)
        .send({ nombre: 'Nueva' });

      expect(response.status).toBe(403);
    });

    it('debería retornar 401 si no se envía token', async () => {
      const response = await request(app).get('/api/v1/especialidades');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/especialidades', () => {
    it('debería insertar una especialidad y retornar 201', async () => {
      const nueva = { nombre: 'DERMATOLOGÍA' };

      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nueva);

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe('DERMATOLOGÍA');

      const [rows] = await pool.execute('SELECT * FROM especialidades WHERE id_especialidad = ?', [
        response.body.data.id,
      ]);
      expect(rows).toHaveLength(1);
    });

    it('debería retornar 409 si el nombre ya existe', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'PEDIATRÍA' }); // Existe en el seed

      expect(response.status).toBe(409);
    });
  });

  describe('PUT /api/v1/especialidades/:id', () => {
    it('debería actualizar el nombre correctamente', async () => {
      // Obtenemos una de las creadas en el seed
      const [rowsBefore] = await pool.execute('SELECT id_especialidad FROM especialidades LIMIT 1');
      const id = rowsBefore[0].id_especialidad;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'ESPECIALIDAD MODIFICADA' });

      expect(response.status).toBe(200);

      const [rowsAfter] = await pool.execute(
        'SELECT nombre FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rowsAfter[0].nombre).toBe('ESPECIALIDAD MODIFICADA');
    });
  });

  describe('GET /api/v1/especialidades', () => {
    it('debería retornar la lista de especialidades', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.total).toBeDefined();
    });

    it('debería filtrar por nombre', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades?nombre=pediatra')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((e) => e.nombre.toLowerCase().includes('pediatra'))).toBe(
        true,
      );
    });
  });

  describe('DELETE /api/v1/especialidades/:id', () => {
    it('debería realizar un borrado lógico', async () => {
      const [rowsBefore] = await pool.execute('SELECT id_especialidad FROM especialidades LIMIT 1');
      const id = rowsBefore[0].id_especialidad;

      const response = await request(app)
        .delete(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const [rowsAfter] = await pool.execute(
        'SELECT activo FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rowsAfter[0].activo).toBe(0);
    });
  });
});
