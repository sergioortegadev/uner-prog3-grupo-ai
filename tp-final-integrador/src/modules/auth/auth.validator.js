import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/validate.middleware.js';

/**
 * Validaciones para el módulo de autenticación.
 */

export const loginValidator = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .notEmpty()
    .withMessage('El email es requerido'),
  body('contrasenia').notEmpty().withMessage('La contraseña es requerida'),
  validateRequest,
];
