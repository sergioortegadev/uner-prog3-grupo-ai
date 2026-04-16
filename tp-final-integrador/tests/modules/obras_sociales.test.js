import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Obras Sociales - Integration Tests', () => {
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
    it('debería retornar 403 si un Paciente intenta acceder', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${pacienteToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('debería retornar 401 si no se envía token', async () => {
      const response = await request(app).get('/api/v1/obras-sociales');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/obras-sociales', () => {
    it('debería insertar una obra social en la base de datos y retornar 201', async () => {
      const nuevaObra = {
        nombre: 'OSDE 210',
        descripcion: 'Plan básico',
        porcentajeDescuento: 10.5,
        esParticular: false,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute('SELECT * FROM obras_sociales WHERE id_obra_social = ?', [
        response.body.data.id,
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0].nombre).toBe('OSDE 210');
    });

    it('debería retornar 422 si falta la descripción', async () => {
      const nuevaObra = {
        nombre: 'Sin Descripción',
        porcentajeDescuento: 10.5,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 409 si el nombre ya existe', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Duplicada', 'Test', 15, 0, 1],
      );

      const nuevaObra = {
        nombre: 'Duplicada',
        descripcion: 'Otra',
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debería reactivar una obra social borrada lógicamente', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Inactiva', 'Vieja', 10, 0, 0],
      );

      const reactivada = {
        nombre: 'Inactiva',
        descripcion: 'Nueva',
        porcentajeDescuento: 20,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reactivada);

      expect(response.status).toBe(201);

      const [rows] = await pool.execute(
        'SELECT activo, descripcion, porcentaje_descuento FROM obras_sociales WHERE nombre = ?',
        ['Inactiva'],
      );
      expect(rows[0].activo).toBe(1);
      expect(rows[0].descripcion).toBe('Nueva');
      expect(Number(rows[0].porcentaje_descuento)).toBe(20);
    });
  });

  describe('PUT /api/v1/obras-sociales/:id', () => {
    it('debería actualizar los datos correctamente', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['A Actualizar', 'Test', 15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Actualizada' });

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT nombre FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].nombre).toBe('Actualizada');
    });

    it('debería retornar 409 al actualizar con un nombre que ya existe en otra obra social', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Existe', 'Test', 15, 0, 1],
      );
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Otra', 'Test', 15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Existe' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/obras-sociales', () => {
    it('debería retornar la lista real desde la base de datos', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Swiss Medical', 'Prepaga', 15, 0, 1],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.some((o) => o.nombre === 'Swiss Medical')).toBe(true);
    });
  });

  describe('DELETE /api/v1/obras-sociales/:id', () => {
    it('debería realizar un borrado lógico (activo = 0) en la base de datos', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Para Borrar', 'Test', 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .delete(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT activo FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].activo).toBe(0);
    });
  });

  describe('Casos 404 Not Found', () => {
    it('GET /api/v1/obras-sociales/:id - debería retornar 404 si el ID no existe', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('PUT /api/v1/obras-sociales/:id - debería retornar 404 si el ID no existe', async () => {
      const response = await request(app)
        .put('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Inexistente' });

      expect(response.status).toBe(404);
    });

    it('DELETE /api/v1/obras-sociales/:id - debería retornar 404 si el ID no existe', async () => {
      const response = await request(app)
        .delete('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
