import { body, param } from 'express-validator';

/**
 * Validaciones para el módulo de Especialidades
 */

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo').toInt(),
];

export const validateCreate = [
  body('nombre')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre de la especialidad es requerido')
    .isLength({ max: 120 })
    .withMessage('El nombre no puede superar los 120 caracteres'),
];

export const validateUpdate = [
  ...validateId,
  body('nombre')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío si se proporciona')
    .isLength({ max: 120 })
    .withMessage('El nombre no puede superar los 120 caracteres'),
];
