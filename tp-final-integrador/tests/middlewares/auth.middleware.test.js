import { ROLES } from '../../src/constants/roles.constants.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let req, res, next;
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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

  describe('verifyToken', () => {
    it('debería permitir acceso con un token válido', async () => {
      const payload = { id: 1, rol: ROLES.ADMIN, documento: '12345678' };
      const token = jwt.sign(payload, JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(payload.id);
      expect(next).toHaveBeenCalled();
    });

    it('debería retornar 401 si no hay token', async () => {
      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debería retornar 401 si el token es inválido', async () => {
      req.headers.authorization = 'Bearer token-invalido';

      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debería retornar 401 si el formato del header no es Bearer', async () => {
      req.headers.authorization = 'Basic YWxhZGRpbjpvcGVuc2VzYW1l';

      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debería retornar 401 si el token ha expirado', async () => {
      const payload = { id: 1, rol: ROLES.ADMIN };
      // Crea un token que expiró en el pasado
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
      req.headers.authorization = `Bearer ${token}`;

      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Token inválido o expirado');
    });

    it('debería retornar 401 si provee Bearer pero está vacío', async () => {
      req.headers.authorization = 'Bearer ';

      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');
      await verifyToken(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('requireRole', () => {
    it('debería retornar 403 si el rol no está permitido', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: ROLES.PACIENTE }; // Paciente

      const middleware = requireRole([3]); // Solo Admin
      await middleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('debería llamar a next() si el rol es correcto', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: ROLES.ADMIN }; // Admin

      const middleware = requireRole([3]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debería retornar 401 si no hay usuario (req.user no existe)', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      // No seteamos req.user simulando que no pasó por verifyToken
      delete req.user;

      const middleware = requireRole([ROLES.ADMIN]);
      await middleware(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('No autenticado');
    });

    it('debería permitir acceso si el usuario tiene uno de múltiples roles permitidos', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: ROLES.MEDICO };

      const middleware = requireRole([ROLES.ADMIN, ROLES.MEDICO]); // Requiere Admin o Médico
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled(); // Se cumple la condición
    });
  });
});
