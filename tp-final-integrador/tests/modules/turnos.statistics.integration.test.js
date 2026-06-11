import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { pool } from '../../src/config/db.js';
import { setupTestDB } from '../setup/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('GET /api/v1/turnos/estadisticas - Integration Tests', () => {
  let adminToken;

  beforeEach(async () => {
    await setupTestDB();

    // 1. Especialidad
    await pool.execute(
      'INSERT INTO especialidades (id_especialidad, nombre, activo) VALUES (?, ?, ?)',
      [1, 'PEDIATRÍA', 1],
    );

    // 2. Obra social
    await pool.execute(
      'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'OSDE', 'Plan 210', 0.1, 0, 1],
    );

    // 3. Usuarios
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [2, '22222222', 'Medico', 'Doc', 'medico@test.com', 'hash', '', ROLES.MEDICO, 1],
    );
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [3, '33333333', 'Paciente', 'Uno', 'pac1@test.com', 'hash', '', ROLES.PACIENTE, 1],
    );
    await pool.execute(
      'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [4, '44444444', 'Paciente', 'Dos', 'pac2@test.com', 'hash', '', ROLES.PACIENTE, 1],
    );

    // 4. Médico
    await pool.execute(
      'INSERT INTO medicos (id_medico, id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?, ?)',
      [1, 2, 1, 2000, 5000.0],
    );

    // 5. Pacientes
    await pool.execute(
      'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
      [1, 3, 1],
    );
    await pool.execute(
      'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
      [2, 4, 1],
    );

    // 6. Turnos — todos dentro del último año para que los SPs los incluyan
    await pool.execute(
      'INSERT INTO turnos_reservas (id_turno_reserva, id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 DAY), ?, ?, ?)',
      [1, 1, 1, 1, 4500.0, 0, 1],
    );
    await pool.execute(
      'INSERT INTO turnos_reservas (id_turno_reserva, id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 2 DAY), ?, ?, ?)',
      [2, 1, 1, 1, 4500.0, 1, 1],
    );
    await pool.execute(
      'INSERT INTO turnos_reservas (id_turno_reserva, id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 5 DAY), ?, ?, ?)',
      [3, 1, 2, 1, 4500.0, 0, 1],
    );

    adminToken = jwt.sign({ id: 8, rol: ROLES.ADMIN }, JWT_SECRET);
  });

  afterAll(async () => {
    // cleanup después de todos los tests
    await pool.execute('DELETE FROM turnos_reservas');
    await pool.execute('DELETE FROM pacientes');
    await pool.execute('DELETE FROM medicos');
    await pool.execute('DELETE FROM usuarios WHERE id_usuario IN (2, 3, 4)');
    await pool.execute('DELETE FROM obras_sociales');
    await pool.execute('DELETE FROM especialidades');
  });

  it('debería devolver estadísticas completas sin filtro de paciente', async () => {
    const response = await request(app)
      .get('/api/v1/turnos/estadisticas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { data } = response.body;

    // --- turnosPorMedico ---
    expect(data.turnosPorMedico).toHaveLength(1);
    expect(data.turnosPorMedico[0]).toMatchObject({
      idMedico: 1,
      cantidadTurnos: 3,
    });

    // --- turnosPorFecha ---
    // 3 turnos en 3 fechas distintas → 3 filas
    expect(data.turnosPorFecha).toHaveLength(3);
    data.turnosPorFecha.forEach((row) => {
      expect(row).toHaveProperty('fecha');
      expect(row).toHaveProperty('cantidadTurnos');
      expect(row.cantidadTurnos).toBe(1);
    });

    // --- turnosPorEspecialidad ---
    expect(data.turnosPorEspecialidad).toHaveLength(1);
    expect(data.turnosPorEspecialidad[0]).toMatchObject({
      idEspecialidad: 1,
      especialidad: 'PEDIATRÍA',
      cantidadTurnos: 3,
    });

    // --- turnosPacienteUltimoAnio (sin filtro → todos) ---
    expect(data.turnosPacienteUltimoAnio).toHaveLength(3);
  });

  it('debería filtrar turnos del último año por paciente', async () => {
    const response = await request(app)
      .get('/api/v1/turnos/estadisticas?idPaciente=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { data } = response.body;

    // Solo los turnos del paciente 1
    expect(data.turnosPacienteUltimoAnio).toHaveLength(2);
    data.turnosPacienteUltimoAnio.forEach((turno) => {
      expect(turno.idPaciente).toBe(1);
    });

    // Las demás estadísticas no deberían verse afectadas por el filtro
    expect(data.turnosPorMedico).toHaveLength(1);
    expect(data.turnosPorMedico[0].cantidadTurnos).toBe(3);
    expect(data.turnosPorEspecialidad).toHaveLength(1);
    expect(data.turnosPorEspecialidad[0].cantidadTurnos).toBe(3);
  });

  it('debería devolver arrays vacíos cuando no hay turnos', async () => {
    // Limpiamos solo los turnos para probar el caso vacío
    await pool.execute('DELETE FROM turnos_reservas');

    const response = await request(app)
      .get('/api/v1/turnos/estadisticas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      turnosPorMedico: [],
      turnosPorFecha: [],
      turnosPorEspecialidad: [],
      turnosPacienteUltimoAnio: [],
    });
  });

  it('debería rechazar médicos y pacientes', async () => {
    const medicoToken = jwt.sign({ id: 2, rol: ROLES.MEDICO }, JWT_SECRET);
    const pacienteToken = jwt.sign({ id: 3, rol: ROLES.PACIENTE }, JWT_SECRET);

    const medicoRes = await request(app)
      .get('/api/v1/turnos/estadisticas')
      .set('Authorization', `Bearer ${medicoToken}`);

    const pacienteRes = await request(app)
      .get('/api/v1/turnos/estadisticas')
      .set('Authorization', `Bearer ${pacienteToken}`);

    expect(medicoRes.status).toBe(403);
    expect(pacienteRes.status).toBe(403);
  });

  it('debería rechazar solicitudes sin autenticación', async () => {
    const response = await request(app).get('/api/v1/turnos/estadisticas');
    expect(response.status).toBe(401);
  });

  it('debería rechazar idPaciente inválido (0)', async () => {
    const response = await request(app)
      .get('/api/v1/turnos/estadisticas?idPaciente=0')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(422);
  });
});
