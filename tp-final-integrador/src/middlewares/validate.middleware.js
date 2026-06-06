import { validationResult } from 'express-validator';
import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para capturar errores de express-validator
 * Si hay errores, corta la petición y devuelve un 422 estandarizado.
 * Sino, pasa al siguiente middleware o controlador.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.VALIDATION_ERROR,
      details: errors.array(),
    });
  }

  next();
};
