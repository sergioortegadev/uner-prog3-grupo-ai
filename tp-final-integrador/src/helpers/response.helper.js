/**
 * Definición de errores estandarizados con sus códigos HTTP asociados
 */
export const ERROR_CODES = {
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
  BAD_REQUEST: { code: 'BAD_REQUEST', status: 400 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 503 },
  DUPLICATE_ENTRY: { code: 'DUPLICATE_ENTRY', status: 400 }
};

/**
 * Respuesta de éxito
 */
export const successResponse = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

/**
 * Respuesta de error mejorada
 * @param {Object} res - Objeto de respuesta
 * @param {string} message - Mensaje para el usuario
 * @param {Object} errorType - Tipo de error de ERROR_CODES
 * @param {Array|Object} details - Detalles técnicos (opcional)
 */
export const errorResponse = (res, message, errorType = ERROR_CODES.INTERNAL_ERROR, details = []) => {
  return res.status(errorType.status).json({
    success: false,
    error: {
      code: errorType.code,
      message,
      details
    }
  });
};
