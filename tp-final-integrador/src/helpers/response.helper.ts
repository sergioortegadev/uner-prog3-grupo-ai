import { ERROR_CODES } from './errors.helper.ts';

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
 * @param {Object} params - Objeto de parámetros
 * @param {Object} params.res - Objeto de respuesta de Express
 * @param {Object} [params.errorType] - Tipo de error de ERROR_CODES
 * @param {string} [params.message] - Mensaje opcional personalizado
 * @param {Array|Object} [params.details] - Detalles técnicos (opcional)
 */
export const errorResponse = ({
  res,
  errorType = ERROR_CODES.INTERNAL_ERROR,
  message = null,
  details = [],
}) => {
  return res.status(errorType.status).json({
    success: false,
    error: {
      code: errorType.code,
      message: message || errorType.message || 'Error en la aplicación',
      details,
    },
  });
};
