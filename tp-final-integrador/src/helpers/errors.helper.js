/**
 * Definición de errores estandarizados con sus códigos HTTP asociados
 */
export const ERROR_CODES = {
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Error interno del servidor' },
  BAD_REQUEST: { code: 'BAD_REQUEST', status: 400, message: 'La petición enviada es inválida' },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 422,
    message: 'Error de validación en los datos enviados',
  },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'El recurso solicitado no existe' },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'No tiene autorización para realizar esta acción',
  },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Acceso denegado a este recurso' },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    status: 503,
    message: 'Servicio temporalmente no disponible',
  },
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    status: 409,
    message: 'Ya existe un registro con los datos proporcionados',
  },
  PAYLOAD_TOO_LARGE: {
    code: 'PAYLOAD_TOO_LARGE',
    status: 413,
    message: 'Entidad de solicitud demasiado grande',
  },
};

/**
 * Clase base para errores operacionales de la aplicación.
 */
export class AppError extends Error {
  /**
   * @param {Object} errorConfig - Configuración del error desde ERROR_CODES
   * @param {string} [customMessage] - Mensaje personalizado (opcional)
   * @param {Array|Object} [details] - Detalles adicionales del error (opcional)
   */
  constructor(errorConfig, customMessage = null, details = []) {
    // Usamos el mensaje del diccionario o uno personalizado si se provee
    super(customMessage || errorConfig.message || 'Error en la aplicación');

    this.code = errorConfig.code;
    this.status = errorConfig.status;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
