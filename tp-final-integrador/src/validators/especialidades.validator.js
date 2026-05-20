import { body, param } from 'express-validator';

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
