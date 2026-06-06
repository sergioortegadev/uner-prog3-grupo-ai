import { body, param } from 'express-validator';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Validaciones para el módulo de Turnos
 */

export const validateCreateAppointment = [
  body('idMedico')
    .notEmpty()
    .withMessage('El ID del médico es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del médico debe ser un número entero positivo')
    .toInt(),

  body('idPaciente')
    .if((value, { req }) => req.user?.rol === ROLES.ADMIN)
    .notEmpty()
    .withMessage('El ID del paciente es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero positivo')
    .toInt(),

  body('idObraSocial')
    .if((value, { req }) => req.user?.rol === ROLES.ADMIN)
    .notEmpty()
    .withMessage('El ID de la obra social es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID de la obra social debe ser un número entero positivo')
    .toInt(),

  body('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isDate()
    .withMessage('La fecha debe tener un formato válido (YYYY-MM-DD)')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      if (inputDate < today) {
        throw new Error('La fecha no puede ser en el pasado');
      }
      return true;
    }),

  body('hora')
    .notEmpty()
    .withMessage('La hora es requerida')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('La hora debe tener un formato válido (HH:mm)'),
];

export const validateMarkAsAttended = [
  param('id')
    .notEmpty()
    .withMessage('El ID del turno es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero positivo')
    .toInt(),
];
