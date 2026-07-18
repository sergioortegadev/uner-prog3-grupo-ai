import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.ts';
import { setupTestDB } from '../setup/db.ts';
describe('Duplicate Entry Handling Integration Test', () => {
    let adminToken;
    beforeAll(async () => {
        await setupTestDB();
        // Login as admin
        const loginResponse = await request(app).post('/api/v1/auth/login').send({
            email: 'ferben@correo.com',
            contrasenia: 'password123',
        });
        adminToken = loginResponse.body.data.token;
    });
    it('debería devolver 409 cuando se intenta crear un usuario con un email que ya existe', async () => {
        const userData = {
            documento: '99999999',
            apellido: 'Duplicate',
            nombres: 'User',
            email: 'ferben@correo.com', // Ya existe (se creó en el seed)
            contrasenia: 'password123',
        };
        const response = await request(app)
            .post('/api/v1/usuarios/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(userData);
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
        expect(response.body.error.message).toContain('Ya existe un registro');
    });
    it('debería devolver 409 cuando se intenta crear un usuario con un documento que ya existe', async () => {
        const userData = {
            documento: '51000111', // Ya existe (Benito Fernandez)
            apellido: 'New',
            nombres: 'User',
            email: 'newuser@correo.com',
            contrasenia: 'password123',
        };
        const response = await request(app)
            .post('/api/v1/usuarios/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(userData);
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });
});
