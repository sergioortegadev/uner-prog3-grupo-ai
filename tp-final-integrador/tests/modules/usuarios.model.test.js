import { describe, it, expect, beforeAll } from 'vitest';
import { ROLES } from '../../src/constants/roles.constants.ts';
import * as usuariosModel from '../../src/database/usuarios.ts';
import { setupTestDB } from '../setup/db.ts';
import { pool } from '../../src/config/db.ts';
describe('Usuarios Model', () => {
    beforeAll(async () => {
        await setupTestDB();
    });
    describe('findByCredentials', () => {
        it('debe encontrar un usuario por sus credenciales', async () => {
            const email = 'ferben@correo.com';
            const password = 'password123';
            const user = await usuariosModel.findByCredentials(email, password);
            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.rol).toBe(ROLES.ADMIN);
            expect(user.nombreCompleto).toBeDefined();
        });
        it('debe devolver null si las credenciales son inválidas', async () => {
            const user = await usuariosModel.findByCredentials('ferben@correo.com', 'wrongpassword');
            expect(user).toBeNull();
        });
    });
    describe('createDoctorUser (Transaction/Rollback)', () => {
        it('debería hacer rollback y no crear el usuario si falla la inserción del médico', async () => {
            const emailTest = 'rollback@test.com';
            const docTest = '99999999';
            const doctorData = {
                documento: docTest,
                apellido: 'Test',
                nombres: 'Rollback',
                email: emailTest,
                contrasenia: 'password123',
                id_especialidad: 9999, // Especialidad inexistente -> Falla FK
                matricula: 9999, // Debe ser entero
                valor_consulta: 1000,
            };
            // Se espera que falle por la FK de especialidad
            await expect(usuariosModel.createDoctorUser(doctorData)).rejects.toHaveProperty('code', 'ER_NO_REFERENCED_ROW_2');
            // Verificar que el registro en la tabla 'usuarios' NO existe
            const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [emailTest]);
            expect(rows).toHaveLength(0);
        });
    });
    describe('updateUser', () => {
        it('debe actualizar el documento de un usuario sin errores', async () => {
            const idUsuario = 8; // Admin (Benito Fernandez) según seed.js
            const nuevoDocumento = '12345678';
            const updatedUser = await usuariosModel.updateUser(idUsuario, { documento: nuevoDocumento });
            expect(updatedUser).toBeDefined();
            expect(updatedUser.documento).toBe(nuevoDocumento);
            expect(updatedUser.id).toBe(idUsuario);
        });
        it('debe actualizar múltiples campos incluyendo documento', async () => {
            const idUsuario = 9;
            await pool.execute('INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, SHA2(?, 256), ?, ?, ?)', [
                idUsuario,
                '22222222',
                'Perez',
                'Juan',
                'juan@correo.com',
                'pass123',
                '',
                ROLES.PACIENTE,
                1,
            ]);
            const newData = {
                documento: '87654321',
                apellido: 'Perez Modificado',
                email: 'juan_mod@correo.com',
            };
            const updatedUser = await usuariosModel.updateUser(idUsuario, newData);
            expect(updatedUser).toBeDefined();
            expect(updatedUser.documento).toBe(newData.documento);
            expect(updatedUser.apellido).toBe(newData.apellido);
            expect(updatedUser.email).toBe(newData.email);
        });
    });
});
