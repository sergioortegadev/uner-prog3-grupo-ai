import { body, param } from 'express-validator';

/**
 * Validaciones para el módulo de Pacientes
 */

export const validateAssignObrasSociales = [
  param('id_paciente')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero positivo')
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
