import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';
import { AppError } from '../helpers/errors.helper.js';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Ruta ${req.originalUrl} no encontrada`, ERROR_CODES.NOT_FOUND);
};

/**
 * Manejador de errores global
 */
export const globalErrorHandler = (err, req, res, _next) => {
  // 1. Si es un error operacional (AppError o tiene el flag), respondemos con sus datos
  if (err instanceof AppError || err.isOperational) {
    return errorResponse(
      res,
      err.message,
      {
        code: err.code,
        status: err.status,
      },
      err.details || [],
    );
  }

  // 2. Si llegamos acá, es un BUG (Programming Error) o error no controlado
  console.error('ERROR NO CONTROLADO:', err);

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  // En desarrollo mostramos el stack trace para debuguear mejor
  const details = process.env.NODE_ENV === 'development' ? { stack: err.stack } : [];

  return errorResponse(res, message, { code: 'INTERNAL_ERROR', status }, details);
};
