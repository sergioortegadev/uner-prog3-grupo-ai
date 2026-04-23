import { body } from 'express-validator';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.constants.js';

/**
 * Validaciones para el módulo de usuarios.
 */

export const registerValidator = [
  body('documento')
    .trim()
    .notEmpty()
    .withMessage('El documento es requerido')
    .isLength({ min: 7, max: 20 })
    .withMessage('El documento debe tener entre 7 y 20 caracteres'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('nombres').trim().notEmpty().withMessage('Los nombres son requeridos'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .notEmpty()
    .withMessage('El email es requerido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isInt({ min: 1, max: 3 })
    .withMessage('Rol inválido'),

  // Validaciones condicionales para PACIENTE (Rol 2)
  body('id_obra_social')
    .if(body('rol').custom((value) => Number(value) === ROLES.PACIENTE))
    .notEmpty()
    .withMessage('La obra social es requerida para pacientes')
    .isInt()
    .withMessage('ID de obra social inválido'),

  // Validaciones condicionales para MEDICO (Rol 1)
  body('matricula')
    .if(body('rol').custom((value) => Number(value) === ROLES.MEDICO))
    .notEmpty()
    .withMessage('La matrícula es requerida para médicos')
    .isInt()
    .withMessage('Matrícula inválida'),
  body('id_especialidad')
    .if(body('rol').custom((value) => Number(value) === ROLES.MEDICO))
    .notEmpty()
    .withMessage('La especialidad es requerida para médicos')
    .isInt()
    .withMessage('ID de especialidad inválido'),
  body('valor_consulta')
    .if(body('rol').custom((value) => Number(value) === ROLES.MEDICO))
    .notEmpty()
    .withMessage('El valor de consulta es requerido para médicos')
    .isDecimal()
    .withMessage('El valor de consulta debe ser un número decimal'),

  validateRequest,
];
