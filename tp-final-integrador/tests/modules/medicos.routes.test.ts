import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.ts';
import { pool } from '../../src/config/db.ts';
import { setupTestDB } from '../setup/db.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Médicos Routes - Integration Tests', () => {
  let patientToken, adminToken;
  let doctorId;
  let medicoId, espId, osId;

  beforeEach(async () => {
    await setupTestDB();

    // Create Specialty
    const [espRes] = await pool.execute(
      'INSERT INTO especialidades (nombre, activo) VALUES (?, 1)',
      ['PEDIATRIA'],
    );
    espId = espRes.insertId;

    // Create Obras Social
    const [osRes] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)',
      ['OS 1', 'Desc', 10, 0, 1],
    );
    osId = osRes.insertId;

    // Create Users
    const createUser = async (doc, email, rol) => {
      const [res] = await pool.execute(
        'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [doc, 'Surname', 'Name', email, 'hash', '', rol, 1],
      );
      return {
        id: res.insertId,
        token: jwt.sign({ id: res.insertId, rol, documento: doc }, JWT_SECRET),
      };
    };

    const p = await createUser('1', 'p@test.com', ROLES.PACIENTE);
    patientToken = p.token;

    const a = await createUser('2', 'a@test.com', ROLES.ADMIN);
    adminToken = a.token;

    const d = await createUser('3', 'd@test.com', ROLES.MEDICO);
    doctorId = d.id;

    // Create Médico
    const [mRes] = await pool.execute(
      'INSERT INTO medicos (id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?)',
      [doctorId, espId, 1234, 5000],
    );
    medicoId = mRes.insertId;
  });

  describe('GET /api/v1/medicos (obtenerTodos)', () => {
    it('should return 200 and list for patients', async () => {
      const res = await request(app)
        .get('/api/v1/medicos')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 403 for admin', async () => {
      const res = await request(app)
        .get('/api/v1/medicos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/medicos');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/medicos/:idMedico/obras-sociales (assignObrasSociales)', () => {
    it('should return 201 for admin with valid data', async () => {
      const res = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ obrasSociales: [osId] });

      expect(res.status).toBe(201);
      expect(res.body.data.asociadas).toContain(osId);
    });

    it('should return 403 for patient', async () => {
      const res = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ obrasSociales: [osId] });
      expect(res.status).toBe(403);
    });

    it('should return 422 for invalid body (not array)', async () => {
      const res = await request(app)
        .post(`/api/v1/medicos/${medicoId}/obras-sociales`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ obrasSociales: osId });
      expect(res.status).toBe(422);
    });

    it('should return 404 if medico not found', async () => {
      const res = await request(app)
        .post('/api/v1/medicos/9999/obras-sociales')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ obrasSociales: [osId] });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/medicos/:idMedico/especialidad (updateEspecialidad)', () => {
    it('should return 200 for admin with valid data', async () => {
      const res = await request(app)
        .patch(`/api/v1/medicos/${medicoId}/especialidad`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ idEspecialidad: espId });

      expect(res.status).toBe(200);
      expect(res.body.data.idEspecialidad).toBe(espId);
    });

    it('should return 403 for patient', async () => {
      const res = await request(app)
        .patch(`/api/v1/medicos/${medicoId}/especialidad`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ idEspecialidad: espId });
      expect(res.status).toBe(403);
    });

    it('should return 422 for missing idEspecialidad', async () => {
      const res = await request(app)
        .patch(`/api/v1/medicos/${medicoId}/especialidad`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });

  describe('Method Not Allowed (405)', () => {
    it('should return 405 for DELETE on /', async () => {
      const res = await request(app).delete('/api/v1/medicos');
      expect(res.status).toBe(405);
      expect(res.header.allow).toBe('GET');
    });

    it('should return 405 for GET on /:idMedico/obras-sociales', async () => {
      const res = await request(app).get(`/api/v1/medicos/${medicoId}/obras-sociales`);
      expect(res.status).toBe(405);
      expect(res.header.allow).toBe('POST');
    });
  });
});
