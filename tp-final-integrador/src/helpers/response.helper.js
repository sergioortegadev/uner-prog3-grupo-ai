import { ERROR_CODES } from './errors.helper.js';

/**
 * Respuesta de éxito
 * @param {Object} res - Objeto de respuesta
 * @param {any} data - Datos a devolver (opcional)
 * @param {number} status - Código de estado HTTP (default 200)
 */
export const successResponse = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

/**
 * Respuesta de error mejorada
 * @param {Object} res - Objeto de respuesta
 * @param {string} message - Mensaje para el usuario
 * @param {Object} errorType - Tipo de error de ERROR_CODES
 * @param {Array|Object} details - Detalles técnicos (opcional)
 */
export const errorResponse = (
  res,
  message,
  errorType = ERROR_CODES.INTERNAL_ERROR,
  details = [],
) => {
  return res.status(errorType.status).json({
    success: false,
    error: {
      code: errorType.code,
      message,
      details,
    },
  });
};
