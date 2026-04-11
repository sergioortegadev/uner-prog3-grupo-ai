import { errorResponse, ERROR_CODES } from '../helpers/response.helper.js';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(
    res, 
    `Ruta ${req.originalUrl} no encontrada`, 
    ERROR_CODES.NOT_FOUND
  );
};

/**
 * Mapeo de códigos de estado HTTP a tipos de error
 */
const STATUS_ERROR_MAP = {
  400: ERROR_CODES.BAD_REQUEST,
  401: ERROR_CODES.UNAUTHORIZED,
  403: ERROR_CODES.FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  503: ERROR_CODES.DATABASE_ERROR
};

/**
 * Manejador de errores global
 */
export const globalErrorHandler = (err, req, res, _next) => {
  console.error('Error no controlado:', err);

  const status = err.status || 500;
  
  // Obtenemos el tipo de error del mapa, o usamos INTERNAL_ERROR por defecto
  const errorType = STATUS_ERROR_MAP[status] || ERROR_CODES.INTERNAL_ERROR;

  const message = status === 500 ? 'Error interno del servidor' : err.message;
  
  // En desarrollo mostramos el stack trace para debuguear mejor
  const details = process.env.NODE_ENV === 'development' ? { stack: err.stack } : [];

  return errorResponse(res, message, errorType, details);
};
