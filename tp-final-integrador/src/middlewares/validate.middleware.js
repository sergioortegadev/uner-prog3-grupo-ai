import { validationResult } from 'express-validator';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para capturar errores de express-validator
 * Si hay errores, delega al manejador global de errores.
 * El globalErrorHandler se encarga de limpiar archivos (req.file) si existen.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError(ERROR_CODES.VALIDATION_ERROR, null, errors.array()));
  }

  next();
};
