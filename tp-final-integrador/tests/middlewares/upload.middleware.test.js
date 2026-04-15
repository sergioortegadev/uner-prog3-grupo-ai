import { describe, it, expect } from 'vitest';

describe('Upload Middleware - Multer', () => {
  describe('uploadFotoUsuario', () => {
    it('debería estar definido', async () => {
      const { uploadFotoUsuario } = await import('../../src/middlewares/upload.middleware.js');
      expect(uploadFotoUsuario).toBeDefined();
    });

    it('debería exportar una función de middleware', async () => {
      const { uploadFotoUsuario } = await import('../../src/middlewares/upload.middleware.js');
      expect(typeof uploadFotoUsuario).toBe('function');
    });
  });

  describe('configuración de Multer', () => {
    it('debería existir el middleware de subida', async () => {
      const { uploadFotoUsuario } = await import('../../src/middlewares/upload.middleware.js');
      expect(uploadFotoUsuario).toBeDefined();
    });
  });
});
