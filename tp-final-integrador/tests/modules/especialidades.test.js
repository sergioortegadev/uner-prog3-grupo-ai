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
    // Generamos tokens para las pruebas basándonos en seed.js
    // Admin: id 8, Paciente: id 5
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
    pacienteToken = jwt.sign({ id: 5, rol: ROLES.PACIENTE, documento: '41000111' }, JWT_SECRET);
  });

  describe('Seguridad y Autorización', () => {
    it('debería retornar 403 si un Paciente intenta acceder', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades')
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('debería retornar 401 si no se envía token', async () => {
      const response = await request(app).get('/api/v1/especialidades');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/especialidades', () => {
    it('debería insertar una especialidad en la base de datos y retornar 201', async () => {
      const nuevaEspecialidad = {
        nombre: 'CARDIOLOGÍA',
      };

      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaEspecialidad);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute('SELECT * FROM especialidades WHERE id_especialidad = ?', [
        response.body.data.id,
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0].nombre).toBe('CARDIOLOGÍA');
    });

    it('debería retornar 422 si falta el nombre', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 409 si el nombre ya existe', async () => {
      await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', [
        'DERMATOLOGÍA',
        1,
      ]);

      const nuevaEspecialidad = {
        nombre: 'DERMATOLOGÍA',
      };

      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaEspecialidad);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debería reactivar una especialidad borrada lógicamente', async () => {
      await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', [
        'BORRADA',
        0,
      ]);

      const reactivada = {
        nombre: 'BORRADA',
      };

      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reactivada);

      expect(response.status).toBe(201);

      const [rows] = await pool.execute('SELECT activo FROM especialidades WHERE nombre = ?', [
        'BORRADA',
      ]);
      expect(rows[0].activo).toBe(1);
    });
  });

  describe('PUT /api/v1/especialidades/:id', () => {
    it('debería actualizar el nombre correctamente', async () => {
      const [result] = await pool.execute(
        'INSERT INTO especialidades (nombre, activo) VALUES (?, ?)',
        ['A ACTUALIZAR', 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'ACTUALIZADA' });

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT nombre FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rows[0].nombre).toBe('ACTUALIZADA');
    });

    it('debería retornar 409 al actualizar con un nombre que ya existe', async () => {
      await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', [
        'EXISTE',
        1,
      ]);
      const [result] = await pool.execute(
        'INSERT INTO especialidades (nombre, activo) VALUES (?, ?)',
        ['OTRA', 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'EXISTE' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/especialidades', () => {
    it('debería retornar la lista de especialidades activas', async () => {
      await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', [
        'TEST GET',
        1,
      ]);

      const response = await request(app)
        .get('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.some((e) => e.nombre === 'TEST GET')).toBe(true);
    });
  });

  describe('DELETE /api/v1/especialidades/:id', () => {
    it('debería realizar un borrado lógico', async () => {
      const [result] = await pool.execute(
        'INSERT INTO especialidades (nombre, activo) VALUES (?, ?)',
        ['PARA BORRAR', 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .delete(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT activo FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rows[0].activo).toBe(0);
    });
  });

  describe('Casos 404', () => {
    it('debería retornar 404 si el ID no existe', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
