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
      const payload = { id: 1, rol: 3, documento: '12345678' };
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
  });

  describe('requireRole', () => {
    it('debería retornar 403 si el rol no está permitido', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: 2 }; // Paciente

      const middleware = requireRole([3]); // Solo Admin
      await middleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('debería llamar a next() si el rol es correcto', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: 3 }; // Admin

      const middleware = requireRole([3]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
