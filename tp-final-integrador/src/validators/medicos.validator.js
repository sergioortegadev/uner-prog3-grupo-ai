import { body, param } from 'express-validator';

/**
 * Validaciones para el módulo de Médicos
 */

export const validateAssignObrasSociales = [
  param('idMedico')
    .isInt({ min: 1 })
    .withMessage('El ID del médico debe ser un número entero positivo')
    .toInt(),
  body('obrasSociales')
    .isArray({ min: 1 })
    .withMessage('obrasSociales debe ser un array con al menos un ID')
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs de obras sociales deben ser números enteros positivos');
      }
      return true;
    }),
];

export const validateUpdateEspecialidad = [
  param('idMedico')
    .notEmpty()
    .withMessage('El ID del médico es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del médico debe ser un número entero positivo')
    .toInt(),
  body('idEspecialidad')
    .notEmpty()
    .withMessage('El ID de la especialidad es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la especialidad debe ser un número entero positivo')
    .toInt(),
];

export const validateEspecialidadId = [
  param('id_especialidad')
    .notEmpty()
    .withMessage('El ID de la especialidad es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la especialidad debe ser un número entero positivo')
    .toInt(),
];
