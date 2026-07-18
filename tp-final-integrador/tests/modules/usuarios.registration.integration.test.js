import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.ts';
import { setupTestDB } from '../setup/db.ts';
import { pool } from '../../src/config/db.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';
import { DB_STATUS } from '../../src/constants/common.constants.ts';
describe('Usuarios Registration Integration Tests', () => {
    let adminToken;
    beforeAll(async () => {
        await setupTestDB();
        // Login as default admin to get token
        const response = await request(app).post('/api/v1/auth/login').send({
            email: 'ferben@correo.com',
            contrasenia: 'password123',
        });
        adminToken = response.body.data.token;
    });
    afterEach(async () => {
        // Limpiamos pero mantenemos al admin principal para el token
        await pool.execute('DELETE FROM medicos');
        await pool.execute('DELETE FROM pacientes');
        await pool.execute('DELETE FROM usuarios WHERE email != ?', ['ferben@correo.com']);
        await pool.execute('DELETE FROM especialidades');
    });
    describe('POST /api/v1/usuarios/admin', () => {
        it('debería permitir a un Admin crear otro Admin', async () => {
            const newAdmin = {
                documento: '11111111',
                apellido: 'Admin',
                nombres: 'Nuevo',
                email: 'nuevoadmin@correo.com',
                contrasenia: 'admin123',
            };
            const response = await request(app)
                .post('/api/v1/usuarios/admin')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newAdmin);
            expect(response.status).toBe(201);
            expect(response.body.data.email).toBe(newAdmin.email);
            expect(response.body.data.rol).toBe(ROLES.ADMIN);
        });
        it('debería denegar la creación de Admin si no hay token', async () => {
            const response = await request(app).post('/api/v1/usuarios/admin').send({});
            expect(response.status).toBe(401);
        });
    });
    describe('POST /api/v1/usuarios/medico', () => {
        it('debería permitir a un Admin crear un Médico y persistir en ambas tablas', async () => {
            // 1. Crear especialidad necesaria
            const [espResult] = await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', ['CARDIOLOGIA', 1]);
            const especialidadId = espResult.insertId;
            const newMedico = {
                documento: '22222222',
                apellido: 'Favaloro',
                nombres: 'Rene',
                email: 'favaloro@correo.com',
                contrasenia: 'medico123',
                id_especialidad: especialidadId,
                matricula: 12345,
                valor_consulta: 5000,
                descripcion: 'Médico cardiólogo',
            };
            const response = await request(app)
                .post('/api/v1/usuarios/medico')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newMedico);
            expect(response.status).toBe(201);
            const doctorId = response.body.data.id;
            // 2. Verificar en tabla usuarios
            const [users] = await pool.execute('SELECT * FROM usuarios WHERE id_usuario = ?', [doctorId]);
            expect(users.length).toBe(1);
            expect(users[0].rol).toBe(ROLES.MEDICO);
            // 3. Verificar en tabla medicos
            const [medicos] = await pool.execute('SELECT * FROM medicos WHERE id_usuario = ?', [
                doctorId,
            ]);
            expect(medicos.length).toBe(1);
            expect(medicos[0].matricula).toBe(newMedico.matricula);
            expect(Number(medicos[0].valor_consulta)).toBe(newMedico.valor_consulta);
        });
    });
    describe('POST /api/v1/usuarios/paciente', () => {
        it('debería permitir a un Admin crear un Paciente y asociarlo a la obra social Particular', async () => {
            // 1. Asegurar que existe la obra social Particular (es_particular = 1)
            await pool.execute('DELETE FROM obras_sociales WHERE es_particular = 1');
            await pool.execute('INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)', ['Particular', 'Atención sin obra social', 0, 1, DB_STATUS.ACTIVE]);
            const newPaciente = {
                documento: '33333333',
                apellido: 'Sosa',
                nombres: 'Mercedes',
                email: 'mercedes@correo.com',
                contrasenia: 'paciente123',
            };
            const response = await request(app)
                .post('/api/v1/usuarios/paciente')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newPaciente);
            expect(response.status).toBe(201);
            const pacienteId = response.body.data.id;
            // 2. Verificar en tabla pacientes
            const [pacientes] = await pool.execute('SELECT * FROM pacientes WHERE id_usuario = ?', [
                pacienteId,
            ]);
            expect(pacientes.length).toBe(1);
            // 3. Verificar que el id_obra_social es de la que es_particular = 1
            const [os] = await pool.execute('SELECT es_particular FROM obras_sociales WHERE id_obra_social = ?', [pacientes[0].id_obra_social]);
            expect(os[0].es_particular).toBe(1);
        });
    });
});
