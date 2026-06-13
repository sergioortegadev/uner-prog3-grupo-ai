import { param, check } from 'express-validator';

/**
 * Validaciones para el módulo de Usuarios
 */

export const validateGetById = [
  param('id_usuario')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero positivo')
    .toInt(),
];

export const validateUpdateUser = [
  ...validateGetById,
  check('documento').optional(),
  check('apellido').optional(),
  check('nombres').optional(),
  check('email').optional(),
  check('contrasenia').optional(),
  check('foto_path').optional(),
  check('rol').optional(),
];

export const validateNewUser = [
  check('documento')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario es requerido, y debe ser un numero entero positivo'),
  check('apellido').notEmpty().withMessage('El apellido del usuario es requerido'),
  check('nombres').notEmpty().withMessage('El o los nombres del usuario es requerido'),
  check('email').notEmpty().withMessage('El email del usuario es requerido'),
  check('contrasenia').notEmpty().withMessage('La contrasenia del usuario es requerida'),
];

export const validateNewDoctorUser = [
  check('documento')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario es requerido, y debe ser un numero entero positivo'),
  check('apellido').notEmpty().withMessage('El apellido del usuario es requerido'),
  check('nombres').notEmpty().withMessage('El o los nombres del usuario es requerido'),
  check('email').notEmpty().withMessage('El email del usuario es requerido'),
  check('contrasenia').notEmpty().withMessage('La contrasenia del usuario es requerida'),
  check('id_especialidad')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage(
      'El id_especialidad, y debe ser un numero entero positivo. y estar en la lista de especialidades.',
    ),
  check('matricula')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('La matricula del usuario es requerida, y debe ser un numero entero positivo'),
  check('descripcion').optional(),
  check('valor_consulta')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('El valor_consulta es requerido. Debe ser numero entero positivo'),
];
