import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

describe('Turnos - Integration Tests', () => {
  let adminToken;
  let patientToken;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  beforeEach(async () => {
    await setupTestDB();

    // Insertar datos necesarios para las pruebas
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
    await pool.execute(
      'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [2, 'Particular', 'Sin obra social', 0.0, 1, 1],
    );

    // 2. Usuarios para Medico y Paciente
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [2, '22222222', 'Medico', 'Doc', 'medico@test.com', 'hash', '', ROLES.MEDICO, 1],
    );
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [3, '33333333', 'Paciente', 'User', 'paciente@test.com', 'hash', '', ROLES.PACIENTE, 1],
    );

    // 3. Medico
    await pool.execute(
      'INSERT INTO medicos (id_medico, id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?, ?)',
      [1, 2, 1, 2000, 5000.0],
    );

    // Relación Médico - Obra Social
    await pool.execute(
      'INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)',
      [1, 1, 1],
    );

    // 4. Paciente
    await pool.execute(
      'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
      [1, 3, 1],
    );

    // Generar tokens
    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN, documento: '51000111' }, JWT_SECRET);
    patientToken = jwt.sign({ id: 3, rol: ROLES.PACIENTE, documento: '33333333' }, JWT_SECRET);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/v1/turnos', () => {
    it('Scenario 1: Successful registration with health insurance (201)', async () => {
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valorTotal).toBe(4500.0); // 5000 - 10%
    });

    it('Scenario 2: Successful registration (201)', async () => {
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-16',
        hora: '09:00',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valorTotal).toBe(4500.0); // 5000 - 10%
    });

    it('Scenario 3: Access denied for non-admin user (403)', async () => {
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(payload);

      expect(response.status).toBe(403);
    });

    it('Scenario 4: Validation error - Invalid date (422)', async () => {
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: 'invalid-date',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('Scenario 5: Related entity not found (404)', async () => {
      const payload = {
        idMedico: 999, // No existe
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(404);
    });

    it('Scenario 6: Inactive physician (422)', async () => {
      // Deactivate physician
      await pool.execute('UPDATE usuarios SET activo = 0 WHERE id_usuario = 2');

      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Scenario 7: Inactive health insurance (422)', async () => {
      // Deactivate health insurance
      await pool.execute('UPDATE obras_sociales SET activo = 0 WHERE id_obra_social = 1');

      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Scenario 8: Physician not accepting insurance (422)', async () => {
      // Deactivate relationship
      await pool.execute(
        'UPDATE medicos_obras_sociales SET activo = 0 WHERE id_medico = 1 AND id_obra_social = 1',
      );

      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Scenario 9: Patient double booking (422)', async () => {
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      // Primer registro exitoso
      const firstResponse = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(firstResponse.status).toBe(201);

      // Segundo registro (solapamiento)
      const secondResponse = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(secondResponse.status).toBe(422);
      expect(secondResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(secondResponse.body.error.message).toBe(
        'El médico ya tiene un turno reservado para la misma fecha y hora',
      );
    });

    it('Scenario X: Physician time conflict (422)', async () => {
      // Necesitamos un segundo paciente para que no falle por solapamiento de paciente
      await pool.execute(
        'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [4, '44444444', 'Paciente', 'Dos', 'paciente2@test.com', 'hash', '', 3, 1],
      );
      await pool.execute(
        'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
        [2, 4, 1],
      );

      // Primer turno con médico 1
      const payload1 = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };
      const firstResponse = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload1);

      expect(firstResponse.status).toBe(201);

      // Segundo turno: mismo médico, mismo horario, paciente distinto
      const payload2 = {
        idMedico: 1,
        idPaciente: 2,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };
      const secondResponse = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload2);

      expect(secondResponse.status).toBe(422);
      expect(secondResponse.body.error.code).toBe('VALIDATION_ERROR');
      expect(secondResponse.body.error.message).toBe(
        'El médico ya tiene un turno reservado para la misma fecha y hora',
      );
    });

    it('Scenario Y: Health insurance mismatch with patient (422)', async () => {
      // Paciente 1 tiene idObraSocial = 1 (OSDE); enviamos idObraSocial = 2 (Particular)
      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 2,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Scenario 10: Inactive patient (422)', async () => {
      // Desactivar el paciente
      await pool.execute('UPDATE usuarios SET activo = 0 WHERE id_usuario = 3');

      const payload = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const response = await request(app)
        .post('/api/v1/turnos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
