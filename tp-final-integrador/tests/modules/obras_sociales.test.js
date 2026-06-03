import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Obras Sociales - Integration Tests', () => {
  let adminToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    await setupTestDB();
    // Generamos tokens para las pruebas
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
  });

  describe('POST /api/v1/obras-sociales', () => {
    it('debería insertar una obra social en la base de datos y retornar 201', async () => {
      const nuevaObra = {
        nombre: 'OSDE 210',
        descripcion: 'Plan básico',
        porcentajeDescuento: 0.105,
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

    it('debería retornar 422 si el porcentajeDescuento está fuera de rango (0-1)', async () => {
      const nuevaObra = {
        nombre: 'OS Fuera de Rango',
        descripcion: 'Test',
        porcentajeDescuento: 1.5,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
    });

    it('debería retornar 422 si falta la descripción', async () => {
      const nuevaObra = {
        nombre: 'Sin Descripción',
        porcentajeDescuento: 0.105,
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
        ['Duplicada', 'Test', 0.15, 0, 1],
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
        ['Inactiva', 'Vieja', 0.1, 0, 0],
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

    it('debería retornar 422 si el body está vacío', async () => {
      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si falta el nombre', async () => {
      const nuevaObra = {
        descripcion: 'Solo descripción',
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 409 si el nombre ya existe con diferente case (case-insensitive)', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Swiss Medical', 'Test', 0.15, 0, 1],
      );

      const nuevaObra = {
        nombre: 'swiss medical',
        descripcion: 'Otra desc',
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar el formato DTO camelCase correcto en la respuesta', async () => {
      const nuevaObra = {
        nombre: 'Sancor Salud',
        descripcion: 'Plan 2000',
        porcentajeDescuento: 0.255,
        esParticular: true,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe('Sancor Salud');
      expect(response.body.data.descripcion).toBe('Plan 2000');
      expect(response.body.data.porcentajeDescuento).toBe(0.255);
      expect(response.body.data.esParticular).toBe(true);
      expect(response.body.data.activo).toBe(1);
    });

    it('debería retornar 422 si el nombre supera los 120 caracteres', async () => {
      const nuevaObra = {
        nombre: 'a'.repeat(121),
        descripcion: 'Descripción válida',
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si la descripción supera los 255 caracteres', async () => {
      const nuevaObra = {
        nombre: 'Obra Social Válida',
        descripcion: 'a'.repeat(256),
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si el porcentajeDescuento es negativo', async () => {
      const nuevaObra = {
        nombre: 'Obra Social Negativa',
        descripcion: 'Test desc',
        porcentajeDescuento: -5,
      };

      const response = await request(app)
        .post('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevaObra);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/obras-sociales/:id', () => {
    it('debería actualizar los datos correctamente', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['A Actualizar', 'Test', 0.15, 0, 1],
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

    it('debería retornar 422 al enviar un body vacío en PUT', async () => {
      const response = await request(app)
        .put('/api/v1/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(422);
    });

    it('debería retornar 404 al intentar actualizar una obra social inexistente', async () => {
      const response = await request(app)
        .put('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Inexistente' });

      expect(response.status).toBe(404);
    });

    it('debería permitir actualizar una obra social inactiva (reactivación)', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva Update', 'Test', 0, 0],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Ya Activa', activo: 1 });

      expect(response.status).toBe(200);
      const [rows] = await pool.execute(
        'SELECT activo FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].activo).toBe(1);
    });

    it('debería retornar 409 al actualizar con un nombre que ya existe en otra obra social', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Existe', 'Test', 0.15, 0, 1],
      );
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Otra', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Existe' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debería permitir actualizar manteniendo el mismo nombre', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Mismo Nombre', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Mismo Nombre', descripcion: 'Nueva desc' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute(
        'SELECT descripcion FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].descripcion).toBe('Nueva desc');
    });

    it('debería actualizar múltiples campos simultáneamente', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Multiples Campos', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Campos Multiples',
          descripcion: 'Desc cambiada',
          porcentajeDescuento: 0.5,
          esParticular: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute(
        'SELECT nombre, descripcion, porcentaje_descuento, es_particular FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].nombre).toBe('Campos Multiples');
      expect(rows[0].descripcion).toBe('Desc cambiada');
      expect(Number(rows[0].porcentaje_descuento)).toBe(0.5);
      expect(rows[0].es_particular).toBe(1);
    });

    it('debería retornar 422 si el porcentajeDescuento en PUT es inválido (> 1)', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Descuento Mal', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ porcentajeDescuento: 1.01 });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si el nombre en PUT supera los 120 caracteres', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Nombre Largo Put', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'a'.repeat(121) });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería actualizar sólo la descripción', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Solo Desc', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ descripcion: 'Nueva descripción' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute(
        'SELECT descripcion FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].descripcion).toBe('Nueva descripción');
    });

    it('debería ignorar campos desconocidos en el body', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Ignora Desconocidos', 'Test', 0.15, 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .put(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Ignora Ok', campoInexistente: 'hack' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const [rows] = await pool.execute(
        'SELECT nombre FROM obras_sociales WHERE id_obra_social = ?',
        [id],
      );
      expect(rows[0].nombre).toBe('Ignora Ok');
    });
  });

  describe('GET /api/v1/obras-sociales', () => {
    it('debería retornar la lista con metadatos de paginación', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['Swiss Medical', 'Prepaga', 0.15, 0, 1],
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
        ['Activa Defecto', 'Test', 0.1, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva Defecto', 'Test', 0.1, 0],
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
        ['Activa Filtro', 'Test', 0.1, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva Filtro', 'Test', 0.1, 0],
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
        ['Activa All', 'Test', 0.1, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Inactiva All', 'Test', 0.1, 0],
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

    it('debería retornar 200 con data vacía y total=0 si no hay obras sociales', async () => {
      // Como setupTestDB limpia todo y no siembra obras sociales, la tabla está vacía.
      const response = await request(app)
        .get('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('debería retornar 422 si limit=0', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales?limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si limit > 100', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales?limit=101')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si offset es negativo', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales?offset=-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería filtrar por nombre y estado activo=0 simultáneamente', async () => {
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['PAMI Activa', 'Test', 0, 1],
      );
      await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['PAMI Inactiva', 'Test', 0, 0],
      );

      const response = await request(app)
        .get('/api/v1/obras-sociales?nombre=pami&activo=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].nombre).toBe('PAMI Inactiva');
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

    it('debería retornar 422 si el ID en el path es inválido (string o <= 0)', async () => {
      const response1 = await request(app)
        .get('/api/v1/obras-sociales/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response1.status).toBe(422);

      const response2 = await request(app)
        .get('/api/v1/obras-sociales/0')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response2.status).toBe(422);
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

    it('debería retornar 422 si el ID en el path es negativo', async () => {
      const response = await request(app)
        .get('/api/v1/obras-sociales/-5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar la estructura DTO camelCase completa para una obra social', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
        ['DTO Completo', 'Plan Full', 0.2, 1, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .get(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data).toHaveProperty('id', id);
      expect(data).toHaveProperty('nombre', 'DTO Completo');
      expect(data).toHaveProperty('descripcion', 'Plan Full');
      expect(data).toHaveProperty('porcentajeDescuento', 0.2);
      expect(data).toHaveProperty('esParticular', true);
      expect(data).toHaveProperty('activo', 1);
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

    it('debería retornar 404 al intentar eliminar una obra social inexistente', async () => {
      const response = await request(app)
        .delete('/api/v1/obras-sociales/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('debería retornar 404 al intentar eliminar una obra social ya inactiva', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Ya Inactiva', 'Test', 0, 0],
      );
      const id = result.insertId;

      const response = await request(app)
        .delete(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('debería retornar 422 si el ID en DELETE es inválido (string)', async () => {
      const response = await request(app)
        .delete('/api/v1/obras-sociales/abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería realizar un soft delete y no un hard delete (el registro permanece en la base de datos)', async () => {
      const [result] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['Soft Delete Test', 'Test', 0, 1],
      );
      const id = result.insertId;

      const response = await request(app)
        .delete(`/api/v1/obras-sociales/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verificamos que el registro sigue existiendo en la DB
      const [rows] = await pool.execute('SELECT * FROM obras_sociales WHERE id_obra_social = ?', [
        id,
      ]);
      expect(rows).toHaveLength(1);
      expect(rows[0].activo).toBe(0); // Pero inactivo
    });

    it('debería permitir soft delete incluso si está vinculada a un paciente (integridad referencial de BD intacta)', async () => {
      // 1. Insertamos obra social
      const [osResult] = await pool.execute(
        'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, ?)',
        ['OS Vinculada', 'Para Paciente', 0.1, 1],
      );
      const idObraSocial = osResult.insertId;

      // 2. Insertamos usuario para el paciente
      const [userResult] = await pool.execute(
        'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, SHA2(?, 256), ?, ?, ?)',
        ['55555555', 'Paciente', 'Test', 'paciente@test.com', 'password', '', ROLES.PACIENTE, 1],
      );
      const idUsuario = userResult.insertId;

      // 3. Insertamos paciente vinculado a la obra social y al usuario
      await pool.execute('INSERT INTO pacientes (id_usuario, id_obra_social) VALUES (?, ?)', [
        idUsuario,
        idObraSocial,
      ]);

      // 4. Intentamos realizar el soft delete
      const response = await request(app)
        .delete(`/api/v1/obras-sociales/${idObraSocial}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // 5. La respuesta debe ser exitosa ya que es soft-delete y no viola FK de MySQL
      expect(response.status).toBe(200);

      // 6. Verificamos que sigue estando en la base de datos con activo = 0
      const [rows] = await pool.execute(
        'SELECT activo FROM obras_sociales WHERE id_obra_social = ?',
        [idObraSocial],
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

    it('debería retornar 405 para PUT en la colección (/)', async () => {
      const response = await request(app)
        .put('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'GET, POST');
    });

    it('debería retornar 405 para DELETE en la colección (/)', async () => {
      const response = await request(app)
        .delete('/api/v1/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'GET, POST');
    });

    it('debería retornar 405 para PATCH en el recurso (/:id)', async () => {
      const response = await request(app)
        .patch('/api/v1/obras-sociales/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.header).toHaveProperty('allow', 'GET, PUT, DELETE');
    });
  });
});
