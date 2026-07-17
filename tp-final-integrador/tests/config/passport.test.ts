import { describe, it, expect, vi, beforeEach } from 'vitest';
import passport from '../../src/config/passport.ts';
import * as authService from '../../src/services/auth.service.ts';
import * as usuariosModel from '../../src/database/usuarios.ts';
import { ERROR_CODES, AppError } from '../../src/helpers/errors.helper.ts';

vi.mock('../../src/services/auth.service.js');
vi.mock('../../src/database/usuarios.js');

describe('Passport Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LocalStrategy', () => {
    it('debería registrar la estrategia local', () => {
      expect(passport._strategies.local).toBeDefined();
    });

    it('debería llamar a authService.login y retornar done(null, result) con credenciales válidas', async () => {
      const mockResult = { token: 'valid-token', user: { id: 1, email: 'test@example.com' } };
      authService.login.mockResolvedValue(mockResult);

      const localStrategy = passport._strategies.local;
      const done = vi.fn();

      await localStrategy._verify('test@example.com', 'password123', done);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(done).toHaveBeenCalledWith(null, mockResult);
    });

    it('debería retornar done(null, false) si authService.login lanza error de credenciales', async () => {
      const authError = new AppError(ERROR_CODES.UNAUTHORIZED, 'Credenciales inválidas');
      authService.login.mockRejectedValue(authError);

      const localStrategy = passport._strategies.local;
      const done = vi.fn();

      await localStrategy._verify('test@example.com', 'wrongpassword', done);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      expect(done).toHaveBeenCalledWith(null, false, expect.any(Object));
    });

    it('debería retornar done(err) si authService.login lanza un error inesperado de infraestructura', async () => {
      const dbError = new Error('Database connection failed');
      authService.login.mockRejectedValue(dbError);

      const localStrategy = passport._strategies.local;
      const done = vi.fn();

      await localStrategy._verify('test@example.com', 'password123', done);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(done).toHaveBeenCalledWith(dbError);
    });
  });

  describe('JwtStrategy', () => {
    it('debería registrar la estrategia jwt', () => {
      expect(passport._strategies.jwt).toBeDefined();
    });

    it('debería retornar el usuario obtenido de la BD si el payload del JWT es válido', async () => {
      const payload = { id: 1, rol: 3, documento: '12345678', iat: 123456, exp: 234567 };
      const mockUser = { id: 1, rol: 3, email: 'test@example.com' };
      usuariosModel.findById.mockResolvedValue(mockUser);

      const jwtStrategy = passport._strategies.jwt;
      const done = vi.fn();

      await jwtStrategy._verify(payload, done);

      expect(usuariosModel.findById).toHaveBeenCalledWith(payload.id);
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('debería retornar done(null, false) si el usuario no existe en la BD', async () => {
      const payload = { id: 1, rol: 3 };
      usuariosModel.findById.mockResolvedValue(null);

      const jwtStrategy = passport._strategies.jwt;
      const done = vi.fn();

      await jwtStrategy._verify(payload, done);

      expect(usuariosModel.findById).toHaveBeenCalledWith(payload.id);
      expect(done).toHaveBeenCalledWith(null, false);
    });

    it('debería retornar done(err) si ocurre un error en la BD', async () => {
      const payload = { id: 1, rol: 3 };
      const dbError = new Error('DB Error');
      usuariosModel.findById.mockRejectedValue(dbError);

      const jwtStrategy = passport._strategies.jwt;
      const done = vi.fn();

      await jwtStrategy._verify(payload, done);

      expect(done).toHaveBeenCalledWith(dbError);
    });

    it('debería retornar done(null, false) si el payload del JWT es falsy (token faltante)', async () => {
      const jwtStrategy = passport._strategies.jwt;
      const done = vi.fn();

      await jwtStrategy._verify(null, done);

      expect(done).toHaveBeenCalledWith(null, false);
    });
  });
});
