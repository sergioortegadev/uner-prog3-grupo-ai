import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { ROLES } from '../../src/constants/roles.constants.ts';
import * as usuariosModel from '../../src/database/usuarios.ts';
import { clearDatabase } from '../setup/db.ts';
import { pool } from '../../src/config/db.ts';
describe('Usuarios Model - createPacienteUser', () => {
    beforeAll(async () => {
        await clearDatabase();
    });
    afterEach(async () => {
        await clearDatabase();
    });
    it('debe crear un paciente exitosamente cuando existe una obra social "Particular"', async () => {
        // 1. Insertar una obra social marcada como particular
        const [osResult] = await pool.execute('INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)', ['Obra Social de Test', 'Particular Test', 0, 1, 1]);
        const particularId = osResult.insertId;
        // 2. Datos del nuevo paciente
        const newPaciente = {
            documento: '99999999',
            apellido: 'Test',
            nombres: 'Paciente',
            email: 'test_paciente@correo.com',
            contrasenia: 'password123',
        };
        // 3. Ejecutar la creación
        const createdUser = await usuariosModel.createPacienteUser(newPaciente);
        // 4. Verificaciones
        expect(createdUser).toBeDefined();
        expect(createdUser.rol).toBe(ROLES.PACIENTE);
        expect(createdUser.email).toBe(newPaciente.email);
        // 5. Verificar que se creó en la tabla pacientes con el ID correcto de obra social
        const [pacientes] = await pool.execute('SELECT id_obra_social FROM pacientes WHERE id_usuario = ?', [createdUser.id]);
        expect(pacientes.length).toBe(1);
        expect(pacientes[0].id_obra_social).toBe(particularId);
    });
    it('debe lanzar un error si NO existe una obra social marcada como particular', async () => {
        // No insertamos ninguna obra social, o insertamos una que NO sea particular
        await pool.execute('INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)', ['Normal OS', 'Not particular', 0.1, 0, 1]);
        const newPaciente = {
            documento: '88888888',
            apellido: 'Error',
            nombres: 'Test',
            email: 'error@correo.com',
            contrasenia: 'password123',
        };
        // Al no haber ninguna OS con es_particular = 1, debe fallar
        await expect(usuariosModel.createPacienteUser(newPaciente)).rejects.toThrow('No se encontró la obra social "Particular" en el sistema.');
        // Verificar que no se creó el usuario (rollback)
        const [users] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [
            newPaciente.email,
        ]);
        expect(users.length).toBe(0);
    });
});
