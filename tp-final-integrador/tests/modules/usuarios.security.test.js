import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.ts';
import { setupTestDB } from '../setup/db.ts';
import { pool } from '../../src/config/db.ts';
import fs from 'node:fs';
import path from 'node:path';
describe('Usuarios Security Integration Tests', () => {
    let adminToken;
    let patientToken;
    let patientId = 9;
    const TEST_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'test-usuarios-security');
    beforeAll(async () => {
        process.env.UPLOADS_DIR = TEST_UPLOADS_DIR;
        await setupTestDB();
        if (!fs.existsSync(TEST_UPLOADS_DIR)) {
            fs.mkdirSync(TEST_UPLOADS_DIR, { recursive: true });
        }
        // Login as admin
        const adminLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'ferben@correo.com',
            contrasenia: 'password123',
        });
        adminToken = adminLogin.body.data.token;
        // Create a patient to test
        await pool.execute('INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, SHA2(?, 256), ?, ?, ?)', [
            patientId,
            '22222222',
            'Perez',
            'Juan',
            'juan@correo.com',
            'pass123',
            'legit_photo.jpg',
            2,
            1,
        ]);
        // Login as patient
        const patientLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'juan@correo.com',
            contrasenia: 'pass123',
        });
        patientToken = patientLogin.body.data.token;
    });
    it('debería prohibir a un Paciente actualizar cualquier perfil (incluido el suyo)', async () => {
        const response = await request(app)
            .put(`/api/v1/usuarios/${patientId}`)
            .set('Authorization', `Bearer ${patientToken}`)
            .send({
            nombres: 'Juan Modificado',
        });
        expect(response.status).toBe(403);
    });
    it('debería prohibir a un Paciente ver cualquier perfil (incluido el suyo)', async () => {
        const response = await request(app)
            .get(`/api/v1/usuarios/${patientId}`)
            .set('Authorization', `Bearer ${patientToken}`);
        expect(response.status).toBe(403);
    });
    it('debería ignorar foto_path si se envía en el body (Admin actualizando, Arbitrary File Delete protection)', async () => {
        const response = await request(app)
            .put(`/api/v1/usuarios/${patientId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            nombres: 'Juan Admin Modificado',
            foto_path: 'malicious_path.jpg',
        });
        expect(response.status).toBe(200);
        // Verificamos que foto_path NO cambió en la base de datos
        const [rows] = await pool.execute('SELECT foto_path FROM usuarios WHERE id_usuario = ?', [
            patientId,
        ]);
        expect(rows[0].foto_path).toBe('legit_photo.jpg');
        expect(rows[0].foto_path).not.toBe('malicious_path.jpg');
    });
    it('un Admin debería poder ver el perfil de un Paciente', async () => {
        const response = await request(app)
            .get(`/api/v1/usuarios/${patientId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(patientId);
    });
    describe('Photo Update Cleanup', () => {
        const dummyFixturePath = path.join(process.cwd(), 'tests', 'fixtures', 'test-image.png');
        const oldPhotoName = 'old-photo.png';
        const oldPhotoPath = path.join(TEST_UPLOADS_DIR, oldPhotoName);
        it('debería eliminar la foto antigua y guardar la nueva al actualizar el perfil', async () => {
            const idUsuario = 15;
            // Crear imagen vieja
            fs.writeFileSync(oldPhotoPath, 'old content');
            // Insertar usuario
            await pool.execute('INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, SHA2(?, 256), ?, ?, ?)', [idUsuario, '99999991', 'Photo', 'Clean', 'photo@clean.com', 'pass123', oldPhotoName, 2, 1]);
            // Crear fixture si no existe
            if (!fs.existsSync(dummyFixturePath)) {
                fs.mkdirSync(path.dirname(dummyFixturePath), { recursive: true });
                fs.writeFileSync(dummyFixturePath, 'new content');
            }
            const response = await request(app)
                .put(`/api/v1/usuarios/${idUsuario}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('foto', dummyFixturePath);
            expect(response.status).toBe(200);
            const newPhotoName = response.body.data.fotoPath.split('/').pop();
            expect(fs.existsSync(path.join(TEST_UPLOADS_DIR, newPhotoName))).toBe(true);
            expect(fs.existsSync(oldPhotoPath)).toBe(false);
        });
    });
    afterAll(() => {
        if (fs.existsSync(TEST_UPLOADS_DIR)) {
            fs.rmSync(TEST_UPLOADS_DIR, { recursive: true, force: true });
        }
    });
});
