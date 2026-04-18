import { body, param } from 'express-validator';
import { validateRequest } from '../../middlewares/validate.middleware.js';

/**
 * Validaciones para el módulo de pacientes.
 */

export const validateUpdateObraSocial = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero positivo'),
  body('id_obra_social')
    .exists()
    .withMessage('El ID de la obra social es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la obra social debe ser un número entero positivo'),
  validateRequest,
];
