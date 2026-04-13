import { body } from 'express-validator';
import { validate } from '../../middlewares/validate.middleware.js';

/**
 * Validaciones para el módulo de autenticación.
 */

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .notEmpty()
    .withMessage('El email es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate,
];
