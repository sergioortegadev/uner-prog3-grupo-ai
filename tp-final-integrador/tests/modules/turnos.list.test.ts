import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.ts';
import { pool } from '../../src/config/db.ts';
import { setupTestDB } from '../setup/db.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';

describe('Turnos List - Integration Tests', () => {
  let adminToken;
  let patientToken;
  let doctorToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    await setupTestDB();

    // 1. Especialidad
    await pool.execute(
      'INSERT INTO especialidades (id_especialidad, nombre, activo) VALUES (?, ?, ?)',
      [1, 'PEDIATRÍA', 1],
    );

    // 2. Obra Social
    await pool.execute(
      'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'OSDE', 'Plan 210', 0.1, 0, 1],
    );

    // 3. Usuarios
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, '11111111', 'Admin', 'Root', 'admin@test.com', 'hash', '', ROLES.ADMIN, 1],
    );
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [2, '22222222', 'Medico', 'Doc', 'medico@test.com', 'hash', '', ROLES.MEDICO, 1],
    );
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [3, '33333333', 'Paciente', 'User', 'paciente@test.com', 'hash', '', ROLES.PACIENTE, 1],
    );

    // 4. Medico
    await pool.execute(
      'INSERT INTO medicos (id_medico, id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?, ?)',
      [1, 2, 1, 2000, 5000.0],
    );

    // 5. Paciente
    await pool.execute(
      'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
      [1, 3, 1],
    );

    // 6. Turno
    await pool.execute(
      'INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 1, '2026-07-15 14:30:00', 4500.0, 0, 1],
    );

    // Tokens
    adminToken = jwt.sign({ id: 1, rol: ROLES.ADMIN, documento: '11111111' }, JWT_SECRET);
    doctorToken = jwt.sign({ id: 2, rol: ROLES.MEDICO, documento: '22222222' }, JWT_SECRET);
    patientToken = jwt.sign({ id: 3, rol: ROLES.PACIENTE, documento: '33333333' }, JWT_SECRET);
  });

  afterEach(async () => {
    await setupTestDB(); // setupTestDB ya limpia la base
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/turnos', () => {
    it('Doctor should see their own turnos', async () => {
      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].paciente).toBeDefined();
      expect(response.body.data[0].paciente.id).toBe(1);
      expect(response.body.data[0].paciente.apellido).toBe('Paciente');
      expect(response.body.data[0].medico).toBeUndefined();
    });

    it('Patient should see their own turnos', async () => {
      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].medico).toBeDefined();
      expect(response.body.data[0].medico.id).toBe(1);
      expect(response.body.data[0].medico.apellido).toBe('Medico');
      expect(response.body.data[0].paciente).toBeUndefined();
    });

    it('Admin should be forbidden from listing turnos (not a doctor or patient)', async () => {
      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });

    it('Doctor without profile should return 404', async () => {
      // Create user with doctor role but no medicos entry
      await pool.execute(
        'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [4, '44444444', 'Ghost', 'Doc', 'ghost@test.com', 'hash', '', ROLES.MEDICO, 1],
      );
      const ghostToken = jwt.sign({ id: 4, rol: ROLES.MEDICO, documento: '44444444' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${ghostToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Perfil de médico no encontrado');
    });

    it('Patient without profile should return 404', async () => {
      // Create user with patient role but no pacientes entry
      await pool.execute(
        'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [5, '55555555', 'Ghost', 'Patient', 'ghostpatient@test.com', 'hash', '', ROLES.PACIENTE, 1],
      );
      const ghostToken = jwt.sign(
        { id: 5, rol: ROLES.PACIENTE, documento: '55555555' },
        JWT_SECRET,
      );

      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${ghostToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Perfil de paciente no encontrado');
    });

    it('Should not list inactive turnos', async () => {
      // Create an inactive turno
      await pool.execute(
        'INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 1, '2026-07-16 10:00:00', 4500.0, 0, 0], // Activo = 0
      );

      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      // Should only see the active one from beforeEach
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].fechaHora).not.toContain('2026-07-16 10:00:00');
    });

    it('Should return turnos ordered by date descending', async () => {
      // Add a second turno for the same patient, but EARLIER than the one in beforeEach (2026-07-15 14:30:00)
      await pool.execute(
        'INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 1, '2026-07-10 09:00:00', 4500.0, 0, 1],
      );

      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);

      // The first one should be the LATEST (July 15th)
      const firstDate = new Date(response.body.data[0].fechaHora);
      const secondDate = new Date(response.body.data[1].fechaHora);

      expect(firstDate.getTime()).toBeGreaterThan(secondDate.getTime());
      expect(response.body.data[0].fechaHora).toContain('2026-07-15');
      expect(response.body.data[1].fechaHora).toContain('2026-07-10');
    });

    it('Should return an empty array if no turnos found', async () => {
      // Create a new patient without turnos
      await pool.execute(
        'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [6, '66666666', 'New', 'Patient', 'new@test.com', 'hash', '', ROLES.PACIENTE, 1],
      );
      await pool.execute(
        'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
        [2, 6, 1],
      );
      const newToken = jwt.sign({ id: 6, rol: ROLES.PACIENTE, documento: '66666666' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/v1/turnos')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('Should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/v1/turnos');
      expect(response.status).toBe(401);
    });

    it('Should support pagination via limit and offset query params', async () => {
      const response = await request(app)
        .get('/api/v1/turnos?limit=1&offset=0')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(1);
      expect(response.body.meta.limit).toBe(1);
      expect(response.body.meta.offset).toBe(0);
    });

    it('Should filter by "atendido" status', async () => {
      // 1. Create an attended turno (atendido = 1)
      await pool.execute(
        'INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 1, '2026-06-01 10:00:00', 4500.0, 1, 1],
      );

      // 2. Fetch only attended turnos
      const attendedResponse = await request(app)
        .get('/api/v1/turnos?atendido=1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(attendedResponse.status).toBe(200);
      expect(attendedResponse.body.data.length).toBe(1);
      expect(attendedResponse.body.data[0].atendido).toBe(true);
      expect(attendedResponse.body.data[0].fechaHora).toContain('2026-06-01');

      // 3. Fetch only pending (not attended) turnos
      const pendingResponse = await request(app)
        .get('/api/v1/turnos?atendido=0')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(pendingResponse.status).toBe(200);
      expect(pendingResponse.body.data.length).toBe(1);
      expect(pendingResponse.body.data[0].atendido).toBe(false);
      expect(pendingResponse.body.data[0].fechaHora).toContain('2026-07-15'); // From beforeEach
    });

    it('Should support custom sorting via "order" and "asc" params', async () => {
      // Current turno from beforeEach: 2026-07-15 14:30:00
      // 1. Add an earlier turno: 2026-01-01 08:00:00
      await pool.execute(
        'INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [1, 1, 1, '2026-01-01 08:00:00', 4500.0, 0, 1],
      );

      // 2. Sort ASC (Earliest first)
      const ascResponse = await request(app)
        .get('/api/v1/turnos?order=fecha_hora&asc=true')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(ascResponse.status).toBe(200);
      expect(ascResponse.body.data[0].fechaHora).toContain('2026-01-01');
      expect(ascResponse.body.data[1].fechaHora).toContain('2026-07-15');

      // 3. Sort DESC (Latest first - Default)
      const descResponse = await request(app)
        .get('/api/v1/turnos?order=fecha_hora&asc=false')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(descResponse.status).toBe(200);
      expect(descResponse.body.data[0].fechaHora).toContain('2026-07-15');
      expect(descResponse.body.data[1].fechaHora).toContain('2026-01-01');
    });
  });
});
