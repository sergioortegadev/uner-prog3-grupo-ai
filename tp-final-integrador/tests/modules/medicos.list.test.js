import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.ts';
import { pool } from '../../src/config/db.ts';
import { setupTestDB } from '../setup/db.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
describe('Médicos Listado - Integration Tests', () => {
    let patientToken;
    let adminToken;
    let doctorToken;
    let espId;
    beforeEach(async () => {
        await setupTestDB();
        // 1. Create Specialty
        const [espResult] = await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, 1)', ['GENERAL']);
        espId = espResult.insertId;
        // 2. Setup Users and Tokens
        const [pResult] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['123', 'Patient', 'P', 'p@test.com', 'hash', '', ROLES.PACIENTE, 1]);
        patientToken = jwt.sign({ id: pResult.insertId, rol: ROLES.PACIENTE, documento: '123' }, JWT_SECRET);
        const [aResult] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['456', 'Admin', 'A', 'a@test.com', 'hash', '', ROLES.ADMIN, 1]);
        adminToken = jwt.sign({ id: aResult.insertId, rol: ROLES.ADMIN, documento: '456' }, JWT_SECRET);
        const [dResult] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['789', 'Doc', 'D', 'd@test.com', 'hash', '', ROLES.MEDICO, 1]);
        doctorToken = jwt.sign({ id: dResult.insertId, rol: ROLES.MEDICO, documento: '789' }, JWT_SECRET);
    });
    describe('GET /api/v1/medicos', () => {
        it('should return 200 and list of active doctors for patient', async () => {
            // 1. Create Active Doctor
            const [u1] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['111', 'Active', 'Doc', 'active@test.com', 'hash', '', ROLES.MEDICO, 1]);
            await pool.execute('INSERT INTO medicos (id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?)', [u1.insertId, espId, 111, 1000]);
            // 2. Create Inactive Doctor
            const [u2] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['222', 'Inactive', 'Doc', 'inactive@test.com', 'hash', '', ROLES.MEDICO, 0]);
            await pool.execute('INSERT INTO medicos (id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?)', [u2.insertId, espId, 222, 2000]);
            const res = await request(app)
                .get('/api/v1/medicos')
                .set('Authorization', `Bearer ${patientToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].apellido).toBe('Active');
            expect(res.body.data[0].activo).toBe(true);
        });
        it('should return 200 and empty list if no active doctors exist', async () => {
            const res = await request(app)
                .get('/api/v1/medicos')
                .set('Authorization', `Bearer ${patientToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });
        it('should return 401 if no token provided', async () => {
            const res = await request(app).get('/api/v1/medicos');
            expect(res.status).toBe(401);
        });
        it('should return 403 if user is not a patient (e.g., admin)', async () => {
            const res = await request(app)
                .get('/api/v1/medicos')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(403);
        });
        it('should return 403 if user is not a patient (e.g., doctor)', async () => {
            const res = await request(app)
                .get('/api/v1/medicos')
                .set('Authorization', `Bearer ${doctorToken}`);
            expect(res.status).toBe(403);
        });
    });
});
