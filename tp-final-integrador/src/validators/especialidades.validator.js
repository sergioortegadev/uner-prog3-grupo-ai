import { body, param } from 'express-validator';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Validaciones para el módulo de especialidades.
 */

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo').toInt(),
];

export const validateCreate = [
  body('nombre')
    .isString()
    .withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 120 })
    .withMessage('El nombre no puede exceder los 120 caracteres'),
];

export const validateUpdate = [
  ...validateId,
  body().custom((value, { req }) => {
    const fields = ['nombre', 'activo'];
    const hasField = fields.some((field) => req.body[field] !== undefined);
    if (!hasField) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Debe proporcionar al menos un campo válido para actualizar (nombre, activo)',
      );
    }
    return true;
  }),
  body('nombre')
    .optional()
    .isString()
    .withMessage('El nombre debe ser una cadena de texto')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ max: 120 })
    .withMessage('El nombre no puede exceder los 120 caracteres'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser un valor booleano')
    .toBoolean(),
];
