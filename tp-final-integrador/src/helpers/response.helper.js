import { ERROR_CODES } from './errors.helper.js';

/**
 * Respuesta de éxito
 */
export const successResponse = (res, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

/**
 * Respuesta paginada de éxito
 * @param {Object} res - Objeto de respuesta
 * @param {Array} data - Lista de resultados
 * @param {number} total - Total de registros en la DB
 * @param {Object} queryParams - Parámetros aplicados (limit, offset, order, asc, filters)
 */
export const paginatedResponse = (res, data, total, queryParams, status = 200) => {
  const { limit, offset, order, asc, ...filters } = queryParams;

  return res.status(status).json({
    success: true,
    data,
    meta: {
      total,
      limit,
      offset,
      order: order || null,
      asc: asc !== undefined ? asc : true,
      filters: Object.keys(filters).length > 0 ? filters : null,
    },
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
