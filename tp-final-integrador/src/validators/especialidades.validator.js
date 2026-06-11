import { param, check } from 'express-validator';

export const validateId = [
  param('id')
    .notEmpty()
    .withMessage('El ID de la especialidad es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la especialidad debe ser un número entero positivo')
    .toInt(),
];
export const validateCreate = [
  check('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ max: 120 })
    .withMessage('El nombre no debe ser mayor a 120 caracteres.')
    .trim()
    .isString()
    .withMessage('El nombre debe ser una cadena de texto.'),
];

export const validateUpdate = [
  ...validateId,
  check('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ max: 120 })
    .withMessage('El nombre no debe ser mayor a 120 caracteres.')
    .trim()
    .isString()
    .withMessage('El nombre debe ser una cadena de texto.'),
];
