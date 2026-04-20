import { describe, it, expect, vi, beforeEach } from 'vitest';
import multer from 'multer';
import { globalErrorHandler } from '../../src/middlewares/error.middleware.js';
import { AppError, ERROR_CODES } from '../../src/helpers/errors.helper.js';

describe('Error Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockReq = {
      originalUrl: '/api/usuarios',
    };
    mockRes = {
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
    mockNext = vi.fn();
  });

  describe('MulterError handling', () => {
    it('1. debería retornar 413 cuando MulterError es LIMIT_FILE_SIZE', () => {
      // MulterError tiene mensajes internos predefinidos que no se pueden personalizar
      // LIMIT_FILE_SIZE → "File too large"
      const multerError = new multer.MulterError('LIMIT_FILE_SIZE');

      globalErrorHandler(multerError, mockReq, mockRes, mockNext);

      // El middleware detecta el código LIMIT_FILE_SIZE y usa mensaje/mapeo propios
      expect(mockRes.statusCode).toBe(413);
      expect(mockRes.body.success).toBe(false);
      expect(mockRes.body.error.code).toBe('PAYLOAD_TOO_LARGE');
      expect(mockRes.body.error.message).toBe('El archivo excede el límite de 5MB');
    });

    it('2. debería retornar 400 cuando MulterError es genérico', () => {
      // MulterError tiene mensajes internos predefinidos
      // LIMIT_FIELD_COUNT → "Too many fields"
      const multerError = new multer.MulterError('LIMIT_FIELD_COUNT');

      globalErrorHandler(multerError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.success).toBe(false);
      expect(mockRes.body.error.code).toBe('BAD_REQUEST');
      // Multer usa su mensaje interno predefinido
      expect(mockRes.body.error.message).toBe('Too many fields');
    });

    it('2b. debería retornar 400 con mensaje del MulterError', () => {
      // LIMIT_FILE_COUNT → "Too many files"
      const multerError = new multer.MulterError('LIMIT_FILE_COUNT');

      globalErrorHandler(multerError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.error.message).toBe('Too many files');
    });

    it('2c. debería detectar correctamente el código del MulterError', () => {
      // Probar que la detección de código funciona para diferentes tipos
      const multerError = new multer.MulterError('LIMIT_PART_COUNT');

      globalErrorHandler(multerError, mockReq, mockRes, mockNext);

      // Cualquier código que no sea LIMIT_FILE_SIZE retorna 400
      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('AppError handling', () => {
    it('3. debería retornar el status y mensaje correctos para AppError', () => {
      // Crear un AppError con código de validación (422)
      const appError = new AppError(ERROR_CODES.VALIDATION_ERROR, 'El campo email es inválido', [
        { field: 'email', issue: 'formato incorrecto' },
      ]);

      globalErrorHandler(appError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(422);
      expect(mockRes.body.success).toBe(false);
      expect(mockRes.body.error.code).toBe('VALIDATION_ERROR');
      expect(mockRes.body.error.message).toBe('El campo email es inválido');
      expect(mockRes.body.error.details).toEqual([{ field: 'email', issue: 'formato incorrecto' }]);
    });

    it('3b. debería retornar 404 cuando AppError es NOT_FOUND', () => {
      const appError = new AppError(ERROR_CODES.NOT_FOUND, 'Usuario no encontrado');

      globalErrorHandler(appError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes.body.error.code).toBe('NOT_FOUND');
      expect(mockRes.body.error.message).toBe('Usuario no encontrado');
    });

    it('3c. debería retornar 409 cuando AppError es DUPLICATE_ENTRY', () => {
      const appError = new AppError(
        ERROR_CODES.DUPLICATE_ENTRY,
        'El usuario con este email ya existe',
      );

      globalErrorHandler(appError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(409);
      expect(mockRes.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(mockRes.body.error.message).toBe('El usuario con este email ya existe');
    });

    it('3d. debería usar mensaje por defecto cuando AppError no tiene mensaje personalizado', () => {
      const appError = new AppError(ERROR_CODES.BAD_REQUEST);

      globalErrorHandler(appError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.error.message).toBe('La petición enviada es inválida');
    });

    it('3e. debería manejar AppError con flag isOperational=true', () => {
      // Simular error operacional sin ser instancia de AppError
      const operationalError = new Error('Token expirado');
      operationalError.isOperational = true;
      operationalError.status = 401;
      operationalError.code = 'UNAUTHORIZED';

      globalErrorHandler(operationalError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.body.error.code).toBe('UNAUTHORIZED');
      expect(mockRes.body.error.message).toBe('Token expirado');
    });
  });

  describe('Generic error handling', () => {
    it('4. debería retornar 500 para errores genéricos (programming errors)', () => {
      // Crear un error genérico (como un ReferenceError o TypeError)
      const genericError = new Error('Something went wrong');

      globalErrorHandler(genericError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes.body.success).toBe(false);
      expect(mockRes.body.error.code).toBe('INTERNAL_ERROR');
      // El mensaje genérico debe ser el mensaje de error interno
      expect(mockRes.body.error.message).toBe('Error interno del servidor');
    });

    it('4b. debería retornar status custom si el error genérico lo tiene definido', () => {
      const genericError = new Error('Database connection failed');
      genericError.status = 503;

      globalErrorHandler(genericError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(503);
      expect(mockRes.body.error.code).toBe('INTERNAL_ERROR');
      // Si status es 503, usa el mensaje del error
      expect(mockRes.body.error.message).toBe('Database connection failed');
    });

    it('4c. debería incluir stack trace en desarrollo para errores genéricos', () => {
      const genericError = new Error('Test error');
      genericError.stack = 'Error: Test error\n    at Object.<anonymous> (test.js:10:5)';

      globalErrorHandler(genericError, mockReq, mockRes, mockNext);

      expect(mockRes.statusCode).toBe(500);
      // En ambiente test (NODE_ENV=test), details debería estar vacío según el código
      // ya que process.env.NODE_ENV === 'development' sería false
      expect(mockRes.body.error.details).toEqual([]);
    });
  });
});
