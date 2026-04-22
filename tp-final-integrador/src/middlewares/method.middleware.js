import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para manejar métodos no permitidos (405)
 * @param {string[]} allowedMethods - Métodos permitidos para la ruta
 */
export const methodNotAllowedHandler = (allowedMethods) => (req, res) => {
  res.setHeader('Allow', allowedMethods.join(', '));
  return errorResponse(
    res,
    `El método ${req.method} no está permitido para la ruta ${req.originalUrl}`,
    ERROR_CODES.METHOD_NOT_ALLOWED,
  );
};
