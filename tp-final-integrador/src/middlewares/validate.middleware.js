import { validationResult } from 'express-validator';
import { ERROR_CODES, AppError } from '../helpers/errors.helper.js';

/**
 * Middleware para capturar errores de express-validator
 * Si hay errores, lanza un AppError para que el manejador global lo capture.
 * Si no, pasa al siguiente middleware o controlador.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, null, errors.array());
  }

  next();
};
