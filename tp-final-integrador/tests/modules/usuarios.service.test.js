import { describe, it, expect, beforeAll } from 'vitest';
import * as usuariosService from '../../src/modules/usuarios/usuarios.service.js';
import { pool } from '../../src/config/db.js';
import { ROLES } from '../../src/constants/roles.constants.js';
import { setupTestDB } from '../setup/db.js';

describe('Usuarios Service', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  it('debe registrar un administrador exitosamente', async () => {
    const userData = {
      documento: '99000111',
      apellido: 'Admin',
      nombres: 'Test',
      email: 'admin@test.com',
      password: 'password123',
      rol: ROLES.ADMIN,
    };

    const result = await usuariosService.registrarUsuario(userData);

    expect(result).toBeDefined();
    expect(result.id_usuario).toBeDefined();
    expect(result.email).toBe(userData.email);

    // Verificamos en la DB
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id_usuario = ?', [
      result.id_usuario,
    ]);
    expect(rows.length).toBe(1);
    expect(rows[0].rol).toBe(ROLES.ADMIN);
  });

  it('debe registrar un paciente y su perfil exitosamente', async () => {
    const userData = {
      documento: '99000222',
      apellido: 'Paciente',
      nombres: 'Test',
      email: 'paciente@test.com',
      password: 'password123',
      rol: ROLES.PACIENTE,
      id_obra_social: 1,
    };

    const result = await usuariosService.registrarUsuario(userData);

    expect(result.id_usuario).toBeDefined();

    // Verificamos tabla pacientes
    const [rows] = await pool.execute('SELECT * FROM pacientes WHERE id_usuario = ?', [
      result.id_usuario,
    ]);
    expect(rows.length).toBe(1);
    expect(rows[0].id_obra_social).toBe(1);
  });

  it('debe registrar un médico y su perfil exitosamente', async () => {
    const userData = {
      documento: '99000555',
      apellido: 'Médico',
      nombres: 'Test',
      email: 'medico@test.com',
      password: 'password123',
      rol: ROLES.MEDICO,
      id_especialidad: 1,
      matricula: 123456,
      valor_consulta: 5000.0,
    };

    const result = await usuariosService.registrarUsuario(userData);

    expect(result.id_usuario).toBeDefined();

    // Verificamos tabla medicos
    const [rows] = await pool.execute('SELECT * FROM medicos WHERE id_usuario = ?', [
      result.id_usuario,
    ]);
    expect(rows.length).toBe(1);
    expect(rows[0].matricula).toBe(123456);
    expect(Number(rows[0].valor_consulta)).toBe(5000.0);
  });

  it('debe fallar si el email ya existe', async () => {
    const userData = {
      documento: '99000333',
      apellido: 'Test',
      nombres: 'Test',
      email: 'admin@test.com', // Ya usado arriba
      password: 'password123',
      rol: ROLES.ADMIN,
    };

    await expect(usuariosService.registrarUsuario(userData)).rejects.toMatchObject({
      code: 'DUPLICATE_ENTRY',
      status: 409,
      message: 'El email ya está registrado',
    });
  });

  it('debe hacer rollback si falla la inserción del perfil', async () => {
    const userData = {
      documento: '99000444',
      apellido: 'Falla',
      nombres: 'Test',
      email: 'falla@test.com',
      password: 'password123',
      rol: ROLES.PACIENTE,
      id_obra_social: 99999, // ID que no existe (debe fallar la FK)
    };

    // Debería tirar error de base de datos
    await expect(usuariosService.registrarUsuario(userData)).rejects.toThrow();

    // Verificamos que el usuario NO se haya creado en la tabla usuarios (Rollback)
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [userData.email]);
    expect(rows.length).toBe(0);
  });

  it('debe fallar si id_especialidad no existe al registrar médico', async () => {
    const userData = {
      documento: '99000666',
      apellido: 'Médico',
      nombres: 'Invalido',
      email: 'medico.invalido@test.com',
      password: 'password123',
      rol: ROLES.MEDICO,
      id_especialidad: 99999, // ID que no existe
      matricula: 654321,
      valor_consulta: 3000.0,
    };

    // Debe tirar error de validación antes de llegar a la DB
    await expect(usuariosService.registrarUsuario(userData)).rejects.toThrow(
      'La especialidad especificada no existe',
    );

    // Verificamos que el usuario NO se haya creado (rollback correcto)
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [userData.email]);
    expect(rows.length).toBe(0);
  });

  it('debe fallar si el documento ya existe', async () => {
    const userData = {
      documento: '99000111', // Ya usado en primer test
      apellido: 'Duplicado',
      nombres: 'Test',
      email: 'duplicado@test.com',
      password: 'password123',
      rol: ROLES.ADMIN,
    };

    await expect(usuariosService.registrarUsuario(userData)).rejects.toMatchObject({
      code: 'DUPLICATE_ENTRY',
      status: 409,
      message: 'El documento ya está registrado',
    });
  });

  it('debe fallar si id_obra_social no existe al registrar paciente', async () => {
    const userData = {
      documento: '99000777',
      apellido: 'Paciente',
      nombres: 'Invalido',
      email: 'paciente.invalido@test.com',
      password: 'password123',
      rol: ROLES.PACIENTE,
      id_obra_social: 99999, // ID que no existe
    };

    await expect(usuariosService.registrarUsuario(userData)).rejects.toThrow(
      'La obra social especificada no existe',
    );

    // Verificamos que el usuario NO se haya creado (rollback correcto)
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [userData.email]);
    expect(rows.length).toBe(0);
  });
});
