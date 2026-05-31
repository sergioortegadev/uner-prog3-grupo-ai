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

  // eslint-disable-next-line vitest/no-disabled-tests
  describe.skip('Seguridad y Autorización', () => {
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
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });

    it('debería retornar 409 si el nombre ya existe (case-insensitive)', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'pediatría' }); // Existe en el seed en mayúsculas

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 409 con mensaje de reactivación si el nombre existe pero está inactivo', async () => {
      // Insertar una especialidad inactiva con nombre único
      await pool.execute("INSERT INTO especialidades (nombre, activo) VALUES ('HOMEOPATÍA', 0)");

      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'HOMEOPATÍA' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(response.body.error.message).toContain('inactiva');
      expect(response.body.error.message).toContain('reactivarla');
    });

    it('debería retornar 422 si el body está vacío', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si falta el nombre', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: '   ' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar 422 si el nombre supera los 120 caracteres', async () => {
      const nombreLargo = 'A'.repeat(121);
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: nombreLargo });

      expect(response.status).toBe(422);
    });

    it('debería retornar el formato DTO correcto (camelCase)', async () => {
      const response = await request(app)
        .post('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'OFTALMOLOGÍA' });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('activo');
      expect(response.body.data.activo).toBe(1);
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

    it('debería permitir mantener el mismo nombre sin retornar error 409', async () => {
      const [rows] = await pool.execute(
        'SELECT id_especialidad, nombre FROM especialidades LIMIT 1',
      );
      const id = rows[0].id_especialidad;
      const nombre = rows[0].nombre;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre });

      expect(response.status).toBe(200);
    });

    it('debería retornar 422 si el body está vacío', async () => {
      const response = await request(app)
        .put('/api/v1/especialidades/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(422);
    });

    it('debería retornar 422 si el nombre supera los 120 caracteres', async () => {
      const nombreLargo = 'A'.repeat(121);
      const response = await request(app)
        .put('/api/v1/especialidades/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: nombreLargo });

      expect(response.status).toBe(422);
    });

    it('debería actualizar múltiples campos (nombre y activo) simultáneamente', async () => {
      const [rows] = await pool.execute('SELECT id_especialidad FROM especialidades LIMIT 1');
      const id = rows[0].id_especialidad;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'CAMBIO TOTAL', activo: false });

      expect(response.status).toBe(200);

      const [rowsAfter] = await pool.execute(
        'SELECT nombre, activo FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rowsAfter[0].nombre).toBe('CAMBIO TOTAL');
      expect(rowsAfter[0].activo).toBe(0);
    });

    it('debería ignorar campos desconocidos en el body', async () => {
      const [rows] = await pool.execute('SELECT id_especialidad FROM especialidades LIMIT 1');
      const id = rows[0].id_especialidad;

      const response = await request(app)
        .put(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'MODIFICADO CON BASURA', campoFalso: 'valor' });

      expect(response.status).toBe(200);

      const [rowsAfter] = await pool.execute(
        'SELECT nombre FROM especialidades WHERE id_especialidad = ?',
        [id],
      );
      expect(rowsAfter[0].nombre).toBe('MODIFICADO CON BASURA');
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

    it('debería retornar una lista vacía si no hay coincidencias', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades?nombre=INEXISTENTE_TEST_12345')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('debería retornar 422 si limit es 0', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades?limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
    });

    it('debería retornar 422 si limit es mayor a 100', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades?limit=101')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
    });

    it('debería retornar 422 si offset es negativo', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades?offset=-5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
    });

    it('debería soportar la combinación de filtro de nombre y activo=0', async () => {
      // Creamos una especialidad inactiva para buscarla
      await pool.execute(
        "INSERT INTO especialidades (nombre, activo) VALUES ('KINESIOLOGÍA INACTIVA', 0)",
      );

      const response = await request(app)
        .get('/api/v1/especialidades?nombre=kinesio&activo=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].nombre).toBe('KINESIOLOGÍA INACTIVA');
      expect(response.body.data[0].activo).toBe(0);
    });
  });

  describe('GET /api/v1/especialidades/:id', () => {
    it('debería retornar una especialidad activa por ID con la estructura DTO correcta', async () => {
      const [rows] = await pool.execute(
        'SELECT id_especialidad FROM especialidades WHERE activo = 1 LIMIT 1',
      );
      const id = rows[0].id_especialidad;

      const response = await request(app)
        .get(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', id);
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('activo', 1);
    });

    it('debería retornar 422 si el ID es negativo', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades/-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
    });

    it('debería retornar 404 si la especialidad no existe', async () => {
      const response = await request(app)
        .get('/api/v1/especialidades/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/especialidades/:id', () => {
    it('debería realizar un borrado lógico', async () => {
      const [rowsBefore] = await pool.execute(
        'SELECT id_especialidad FROM especialidades WHERE activo = 1 LIMIT 1',
      );
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

    it('debería retornar 404 si la especialidad no existe', async () => {
      const response = await request(app)
        .delete('/api/v1/especialidades/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('debería retornar 404 si la especialidad ya fue eliminada (inactiva)', async () => {
      // Insertar una especialidad inactiva directamente
      const [inserted] = await pool.execute(
        "INSERT INTO especialidades (nombre, activo) VALUES ('INACTIVA TEST DELETE', 0)",
      );
      const id = inserted.insertId;

      const response = await request(app)
        .delete(`/api/v1/especialidades/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('debería retornar 422 si el ID es inválido (string)', async () => {
      const response = await request(app)
        .delete('/api/v1/especialidades/invalido')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
    });
  });

  describe('Métodos no permitidos (405)', () => {
    it('debería retornar 405 para PUT en /', async () => {
      const response = await request(app)
        .put('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(405);
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('debería retornar 405 para DELETE en /', async () => {
      const response = await request(app)
        .delete('/api/v1/especialidades')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(405);
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('debería retornar 405 para PATCH en /:id', async () => {
      const response = await request(app)
        .patch('/api/v1/especialidades/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(405);
      expect(response.body.error.code).toBe('METHOD_NOT_ALLOWED');
    });
  });
});
