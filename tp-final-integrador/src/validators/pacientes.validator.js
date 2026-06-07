import { param } from 'express-validator';

/**
 * Validaciones para el módulo de Pacientes
 */

export const validateId = [
  param('id_paciente')
    .notEmpty()
    .withMessage('El id del paciente es requerido')
    .isInt({ min: 1 })
    .withMessage('El id debe ser un número entero positivo')
    .toInt(),
];

export const validateAssignObrasSociales = [
  param('id_paciente')
    .notEmpty()
    .withMessage('El id del paciente es requerido')
    .isInt({ min: 1 })
    .withMessage('El id del paciente debe ser un número entero positivo')
    .toInt(),

  param('id_obra_social')
    .notEmpty()
    .withMessage('El id de la obra social es requerido')
    .isInt({ min: 1 })
    .withMessage('El id de la obra social debe ser un número entero positivo')
    .toInt(),
];
