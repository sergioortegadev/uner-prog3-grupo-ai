import { ROLES } from '../../src/constants/roles.constants.ts';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import passport from 'passport';
vi.mock('passport', () => {
    return {
        default: {
            authenticate: vi.fn(),
        },
    };
});
describe('Auth Middleware', () => {
    let req, res, next;
    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: function (s) {
                this.statusCode = s;
                return this;
            },
            json: function (j) {
                this.body = j;
                return this;
            },
            statusCode: null,
            body: null,
        };
        next = vi.fn();
        vi.clearAllMocks();
    });
    describe('authenticateJwt', () => {
        it('debería permitir acceso con un token válido', async () => {
            const payload = { id: 1, rol: ROLES.ADMIN, documento: '12345678' };
            passport.authenticate.mockImplementation((strategy, options, callback) => {
                return (_req, _res, _next) => {
                    callback(null, payload, null);
                };
            });
            req.headers.authorization = 'Bearer valid-token';
            const { authenticateJwt } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateJwt(req, res, next);
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(payload.id);
            expect(next).toHaveBeenCalled();
        });
        it('debería retornar 401 si no hay token', async () => {
            passport.authenticate.mockImplementation((strategy, options, callback) => {
                return (_req, _res, _next) => {
                    callback(null, false, { message: 'No auth token' });
                };
            });
            const { authenticateJwt } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateJwt(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });
        it('debería retornar 401 si el token es inválido', async () => {
            passport.authenticate.mockImplementation((strategy, options, callback) => {
                return (_req, _res, _next) => {
                    callback(null, false, { message: 'Token inválido o expirado' });
                };
            });
            req.headers.authorization = 'Bearer token-invalido';
            const { authenticateJwt } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateJwt(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });
    });
    describe('requireRole', () => {
        it('debería retornar 403 si el rol no está permitido', async () => {
            const { requireRole } = await import('../../src/middlewares/auth.middleware.ts');
            req.user = { rol: ROLES.PACIENTE }; // Paciente
            const middleware = requireRole([3]); // Solo Admin
            await middleware(req, res, next);
            expect(res.statusCode).toBe(403);
            expect(res.body.error.code).toBe('FORBIDDEN');
        });
        it('debería llamar a next() si el rol es correcto', async () => {
            const { requireRole } = await import('../../src/middlewares/auth.middleware.ts');
            req.user = { rol: ROLES.ADMIN }; // Admin
            const middleware = requireRole([3]);
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
    describe('authenticateLocal', () => {
        it('debería autenticar con credenciales válidas y setear req.user', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            passport.authenticate.mockImplementation((_strategy, _options, callback) => {
                return (_req, _res, _next) => {
                    callback(null, mockUser, null);
                };
            });
            const { authenticateLocal } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateLocal(req, res, next);
            expect(req.user).toBe(mockUser);
            expect(next).toHaveBeenCalled();
        });
        it('debería retornar 401 si las credenciales son inválidas', async () => {
            passport.authenticate.mockImplementation((_strategy, _options, callback) => {
                return (_req, _res, _next) => {
                    callback(null, false, { message: 'Credenciales inválidas' });
                };
            });
            const { authenticateLocal } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateLocal(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('UNAUTHORIZED');
        });
        it('debería retornar 500 si ocurre un error interno en la autenticación', async () => {
            const mockError = new Error('Auth failure');
            passport.authenticate.mockImplementation((_strategy, _options, callback) => {
                return (_req, _res, _next) => {
                    callback(mockError, null, null);
                };
            });
            const { authenticateLocal } = await import('../../src/middlewares/auth.middleware.ts');
            await authenticateLocal(req, res, next);
            expect(next).toHaveBeenCalledWith(mockError);
        });
    });
});
