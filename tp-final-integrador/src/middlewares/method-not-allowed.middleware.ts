import { errorResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

/**
 * Middleware para manejar métodos no permitidos (405)
 * @param {string[]} allowedMethods - Métodos permitidos para la ruta
 */
export const methodNotAllowedHandler = (allowedMethods) => (req, res) => {
  res.setHeader('Allow', allowedMethods.join(', '));
  return errorResponse({
    res,
    errorType: ERROR_CODES.METHOD_NOT_ALLOWED,
    message: `El método ${req.method} no está permitido para la ruta ${req.originalUrl}`,
  });
};
