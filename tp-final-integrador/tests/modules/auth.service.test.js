import { describe, it, expect, beforeAll } from 'vitest';
import * as authService from '../../src/modules/auth/auth.service.js';
import { setupTestDB } from '../setup/db.js';

describe('Auth Service', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  it('debe autenticar un usuario con credenciales válidas y devolver un token', async () => {
    const email = 'ferben@correo.com';
    const password = 'password123'; // Definida en el seed

    const result = await authService.login(email, password);

    expect(result).toBeDefined();
    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(email);
    expect(result.user.rol).toBe(3);
  });

  it('debe fallar si la contraseña es incorrecta', async () => {
    const email = 'ferben@correo.com';
    const password = 'wrongpassword';

    await expect(authService.login(email, password)).rejects.toThrow('Credenciales inválidas');
  });

  it('debe fallar si el usuario no existe', async () => {
    await expect(authService.login('noexiste@correo.com', 'password123')).rejects.toThrow(
      'Credenciales inválidas',
    );
  });
});
