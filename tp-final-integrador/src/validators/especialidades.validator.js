import { param, check } from 'express-validator';


export const validateId = [
    param('id', 'El parámetro debe ser un entero').isInt(),
];

export const validateCreate = [
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isLength({max:120}).withMessage('El nombre no debe ser mayor a 120 caracteres.')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto.'),
];

export const validateUpdate = [
    ...validateId, 
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isLength({max:120}).withMessage('El nombre no debe ser mayor a 120 caracteres.')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto.'),
];