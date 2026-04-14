import { body, param } from 'express-validator';

/**
 * Validaciones para el módulo de Obras Sociales
 */

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo').toInt(),
];

export const validateCreate = [
  body('nombre')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre de la obra social es requerido')
    .isLength({ max: 120 })
    .withMessage('El nombre no puede superar los 120 caracteres'),

  body('descripcion')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('La descripción de la obra social es requerida')
    .isString()
    .withMessage('La descripción debe ser una cadena de texto')
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres'),

  body('porcentajeDescuento')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de descuento debe estar entre 0 y 100')
    .toFloat()
    .default(0.0),

  body('esParticular')
    .optional()
    .isBoolean()
    .withMessage('esParticular debe ser un valor booleano')
    .toBoolean(),
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

  body('descripcion')
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage('La descripción debe ser una cadena de texto')
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres'),

  body('porcentajeDescuento')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de descuento debe estar entre 0 y 100')
    .toFloat(),

  body('esParticular')
    .optional()
    .isBoolean()
    .withMessage('esParticular debe ser un valor booleano')
    .toBoolean(),
];
