import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';

describe('Obras Sociales - Integration Tests', () => {
  beforeEach(async () => {
    // Usamos el helper centralizado
    await setupTestDB();
  });

  describe('POST /api/v1/obras-sociales', () => {
    it('debería insertar una obra social en la base de datos y retornar 201', async () => {
      const nuevaObra = {
        nombre: 'OSDE 210',
        descripcion: 'Plan básico',
        porcentajeDescuento: 10.5,
        esParticular: false,
      };

      const response = await request(app).post('/api/v1/obras-sociales').send(nuevaObra);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute('SELECT * FROM obras_sociales WHERE id_obra_social = ?', [
        response.body.data.id,
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0].nombre).toBe('OSDE 210');
    });

    it('debería retornar 400 si falta la descripción', async () => {
      const nuevaObra = {
        nombre: 'Sin Descripción',
        porcentajeDescuento: 10.5,
      };

      const response = await request(app).post('/api/v1/obras-sociales').send(nuevaObra);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 400 si el nombre ya existe', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Duplicada', 'Test', 15, 0, 1],
      );

      const nuevaObra = {
        nombre: 'Duplicada',
        descripcion: 'Otra',
      };

      const response = await request(app).post('/api/v1/obras-sociales').send(nuevaObra);

      expect(response.status).toBe(400);
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

      const response = await request(app).post('/api/v1/obras-sociales').send(reactivada);

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
        .send({ nombre: 'Actualizada' });

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT nombre FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].nombre).toBe('Actualizada');
    });

    it('debería retornar 400 al actualizar con un nombre que ya existe en otra obra social', async () => {
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
        .send({ nombre: 'Existe' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/obras-sociales', () => {
    it('debería retornar la lista real desde la base de datos', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Swiss Medical', 'Prepaga', 15, 0, 1],
      );

      const response = await request(app).get('/api/v1/obras-sociales');

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

      const response = await request(app).delete(`/api/v1/obras-sociales/${id}`);

      expect(response.status).toBe(200);

      const [rows] = await pool.execute(
        'SELECT activo FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].activo).toBe(0);
    });
  });
});
