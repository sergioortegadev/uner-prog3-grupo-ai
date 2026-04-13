import { describe, it, expect, beforeAll } from 'vitest';
import * as usuariosModel from '../../src/modules/usuarios/usuarios.model.js';
import { setupTestDB } from '../setup/db.js';

describe('Usuarios Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  it('debe encontrar un usuario por su email', async () => {
    const email = 'ferben@correo.com';
    const user = await usuariosModel.findByEmail(email);

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.id_usuario).toBeDefined();
    expect(user.rol).toBe(3); // Admin
  });

  it('debe devolver null si el email no existe', async () => {
    const user = await usuariosModel.findByEmail('inexistente@correo.com');
    expect(user).toBeNull();
  });
});
