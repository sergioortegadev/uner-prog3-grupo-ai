import { param } from 'express-validator';

/**
 * Validaciones para el módulo de Pacientes
 */

export const validateId = [
  param('id_paciente')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
    .toInt(),
];

export const validateAssignObrasSociales = [
  param('id_paciente')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero positivo')
    .toInt(),

  param('id_obra_social')
    .isInt({ min: 1 })
    .withMessage('El ID de la obra social debe ser un número entero positivo')
    .toInt(),
];
