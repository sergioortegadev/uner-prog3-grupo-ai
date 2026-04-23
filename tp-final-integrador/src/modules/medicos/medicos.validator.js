import { body, param, query } from 'express-validator';
import { validateRequest } from '../../middlewares/validate.middleware.js';

/**
 * Validaciones para el módulo de médicos.
 */

export const validateFindAll = [
  query('especialidad')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La especialidad debe ser un número entero positivo'),
  validateRequest,
];

export const validateUpdateEspecialidad = [
  param('id').isInt({ min: 1 }).withMessage('El ID del médico debe ser un número entero positivo'),
  body('id_especialidad')
    .exists()
    .withMessage('El ID de la especialidad es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la especialidad debe ser un número entero positivo'),
  validateRequest,
];

export const validateObraSocial = [
  param('id').isInt({ min: 1 }).withMessage('El ID del médico debe ser un número entero positivo'),
  body('id_obra_social')
    .exists()
    .withMessage('El ID de la obra social es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la obra social debe ser un número entero positivo'),
  validateRequest,
];

export const validateRemoveObraSocial = [
  param('id').isInt({ min: 1 }).withMessage('El ID del médico debe ser un número entero positivo'),
  param('id_obra_social')
    .isInt({ min: 1 })
    .withMessage('El ID de la obra social debe ser un número entero positivo'),
  validateRequest,
];
