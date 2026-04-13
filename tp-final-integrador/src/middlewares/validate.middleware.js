import { validationResult } from 'express-validator';
import { errorResponse, ERROR_CODES } from '../helpers/response.helper.js';

/**
 * Middleware para capturar errores de express-validator
 * Si hay errores, corta la petición y devuelve un 422 estandarizado.
 * Si no, pasa al siguiente middleware o controlador.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      'Error de validación en los datos enviados',
      ERROR_CODES.VALIDATION_ERROR,
      errors.array(),
    );
  }

  next();
};
