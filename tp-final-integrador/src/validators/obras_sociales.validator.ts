import { body, param } from 'express-validator';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.ts';

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
    .isFloat({ min: 0, max: 1 })
    .withMessage(
      'El porcentaje de descuento debe ser un valor decimal entre 0 y 1 (ej: 0.1 para 10%)',
    )
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
  body().custom((value, { req }) => {
    const fields = ['nombre', 'descripcion', 'porcentajeDescuento', 'esParticular', 'activo'];
    const hasField = fields.some((field) => req.body[field] !== undefined);
    if (!hasField) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `Debe proporcionar al menos un campo válido para actualizar (${fields.join(', ')})`,
      );
    }
    return true;
  }),
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
    .isFloat({ min: 0, max: 1 })
    .withMessage(
      'El porcentaje de descuento debe ser un valor decimal entre 0 y 1 (ej: 0.1 para 10%)',
    )
    .toFloat(),

  body('esParticular')
    .optional()
    .isBoolean()
    .withMessage('esParticular debe ser un valor booleano')
    .toBoolean(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser un valor booleano')
    .toBoolean(),
];
