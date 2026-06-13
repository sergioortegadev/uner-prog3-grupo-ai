import { param, body } from 'express-validator';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Validaciones para el módulo de Usuarios
 */

export const validateGetById = [
  param('idUsuario')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo')
    .toInt(),
];

export const validateUpdateUser = [
  ...validateGetById,
  body('documento')
    .optional()
    .isString()
    .withMessage('El documento debe ser una cadena de texto')
    .isLength({ min: 1, max: 20 })
    .withMessage('El documento debe tener entre 1 y 20 caracteres'),
  body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
  body('nombres').optional().notEmpty().withMessage('Los nombres no pueden estar vacíos'),
  body('email').optional().isEmail().withMessage('Debe ser un email válido'),
  body('contrasenia')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .optional()
    .isInt()
    .withMessage('El rol debe ser un número entero')
    .isIn(Object.values(ROLES))
    .withMessage(`El rol debe ser uno de los siguientes: ${Object.values(ROLES).join(', ')}`),
];

export const validateNewUser = [
  body('documento')
    .notEmpty()
    .withMessage('El documento del usuario es requerido')
    .isString()
    .withMessage('El documento debe ser una cadena de texto')
    .isLength({ min: 1, max: 20 })
    .withMessage('El documento debe tener entre 1 y 20 caracteres'),
  body('apellido').notEmpty().withMessage('El apellido del usuario es requerido'),
  body('nombres').notEmpty().withMessage('El o los nombres del usuario es requerido'),
  body('email').notEmpty().isEmail().withMessage('El email del usuario debe ser un email válido'),
  body('contrasenia')
    .notEmpty()
    .withMessage('La contrasenia del usuario es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const validateNewDoctorUser = [
  body('documento')
    .notEmpty()
    .withMessage('El documento del usuario es requerido')
    .isString()
    .withMessage('El documento debe ser una cadena de texto')
    .isLength({ min: 1, max: 20 })
    .withMessage('El documento debe tener entre 1 y 20 caracteres'),
  body('apellido').notEmpty().withMessage('El apellido del usuario es requerido'),
  body('nombres').notEmpty().withMessage('El o los nombres del usuario es requerido'),
  body('email').notEmpty().isEmail().withMessage('El email del usuario debe ser un email válido'),
  body('contrasenia')
    .notEmpty()
    .withMessage('La contrasenia del usuario es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('id_especialidad')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage(
      'El id_especialidad es requerido, debe ser un numero entero positivo y estar en la lista de especialidades.',
    ),
  body('matricula')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('La matricula del usuario es requerida, y debe ser un numero entero positivo'),
  body('descripcion').optional(),
  body('valor_consulta')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('El valor_consulta es requerido. Debe ser numero entero positivo'),
];
