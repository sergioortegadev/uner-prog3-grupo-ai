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

    it('debería retornar 409 si el nombre existe pero está inactivo (sin reactivación automática)', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Inactiva', 'Vieja', 10, 0, 0],
      );

      const nuevaObra = {
        nombre: 'Inactiva',
        descripcion: 'Intento de crear de nuevo',
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
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
    it('debería retornar la lista con metadatos de paginación', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Swiss Medical', 'Prepaga', 15, 0, 1],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
      expect(response.body.data.some((o) => o.nombre === 'Swiss Medical')).toBe(true);
    });

    it('debería soportar paginación (limit y offset)', async () => {
      // Insertamos varias para probar paginación
      for (let i = 1; i <= 5; i++) {
        await pool.execute(
          'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
          [`Obra Paginada ${i}`, 'Test', 0, 1],
        );
      }

      const response = await request(app)
        .get('/api/v1/obras-sociales?limit=2&offset=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.offset).toBe(0);
    });

    it('debería filtrar por nombre (LIKE)', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['PAMI Especial', 'Test', 0, 1],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales?nombre=pami')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((o) => o.nombre.toLowerCase().includes('pami'))).toBe(true);
    });

    it('debería ordenar por nombre descendente', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['AAA', 'Test', 0, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['ZZZ', 'Test', 0, 1],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales?order=nombre&asc=false')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const data = response.body.data;
      const indexAAA = data.findIndex((o) => o.nombre === 'AAA');
      const indexZZZ = data.findIndex((o) => o.nombre === 'ZZZ');
      expect(indexZZZ).toBeLessThan(indexAAA);
    });

    it('debería retornar solo obras sociales activas por defecto', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Activa Defecto', 'Test', 10, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva Defecto', 'Test', 10, 0],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.some((o) => o.nombre === 'Activa Defecto')).toBe(true);
      expect(data.some((o) => o.nombre === 'Inactiva Defecto')).toBe(false);
    });

    it('debería retornar solo obras sociales inactivas cuando activo=0', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Activa Filtro', 'Test', 10, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva Filtro', 'Test', 10, 0],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales?activo=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.some((o) => o.nombre === 'Inactiva Filtro')).toBe(true);
      expect(data.some((o) => o.nombre === 'Activa Filtro')).toBe(false);
    });

    it('debería retornar todas las obras sociales (activas e inactivas) cuando activo=all', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Activa All', 'Test', 10, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva All', 'Test', 10, 0],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales?activo=all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data.some((o) => o.nombre === 'Activa All')).toBe(true);
      expect(data.some((o) => o.nombre === 'Inactiva All')).toBe(true);
    });

    it('debería retornar 422 si el campo de orden es inválido', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales?order=campo_inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/obras-sociales/:id', () => {
    it('debería retornar los datos de una obra social activa', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Obra Por ID', 'Test', 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .get(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.nombre).toBe('Obra Por ID');
    });

    it('debería retornar 404 si la obra social está inactiva', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Obra Inactiva ID', 'Test', 0, 0],
      );
      const id = result.insertId;

      const response = await request(app)
        .get(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 404 si la obra social no existe', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
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

  describe('Métodos No Permitidos (405)', () => {
    it('debería retornar 405 para métodos no soportados en la colección (/)', async () => {
      const response = await request(app)
        .patch('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'GET, POST');
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('debería retornar 405 para métodos no soportados en el recurso (/:id)', async () => {
      const response = await request(app)
        .post('/api/v1/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'GET, PUT, DELETE');
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});
