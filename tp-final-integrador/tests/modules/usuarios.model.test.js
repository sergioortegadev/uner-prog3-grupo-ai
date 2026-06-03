import { describe, it, expect, beforeAll } from 'vitest';
import { ROLES } from '../../src/constants/roles.constants.js';
import * as usuariosModel from '../../src/database/usuarios.js';
import { setupTestDB } from '../setup/db.js';

describe('Usuarios Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

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
