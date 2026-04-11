import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    // Mocks manuales simples para evitar problemas de encadenamiento
    res = {
      status: function(s) { this.statusCode = s; return this; },
      json: function(j) { this.body = j; return this; },
      statusCode: null,
      body: null
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('debería inyectar usuario de prueba por ahora (Placeholder logic)', async () => {
      const { verifyToken } = await import('../../src/middlewares/auth.middleware.js');

      await verifyToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.rol).toBe(3); // Admin
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('debería retornar 403 si el rol no está permitido', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: 1 }; // Paciente

      const middleware = requireRole([3]); // Solo Admin
      await middleware(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('debería llamar a next() si el rol es correcto', async () => {
      const { requireRole } = await import('../../src/middlewares/auth.middleware.js');
      req.user = { rol: 3 }; // Admin

      const middleware = requireRole([3]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.statusCode).toBeNull();
    });
  });
});
