import { query } from 'express-validator';

/**
 * Factory de validaciones para listados con paginación, orden y filtros.
 * @param {string[]} allowedSortFields - Campos permitidos para ordenar.
 * @param {string[]} allowedFilters - Campos permitidos para filtrar.
 * @returns {Array} - Array de validaciones de express-validator.
 */
export const validateListQuery = (allowedSortFields = [], allowedFilters = []) => [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100')
    .toInt()
    .default(10),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número entero no negativo')
    .toInt()
    .default(0),

  query('activo')
    .optional()
    .custom((value) => {
      if (value === 'all' || value === 0 || value === 1 || value === '0' || value === '1') {
        return true;
      }
      throw new Error('El param "activo" debe ser 0, 1 o "all"');
    })
    .customSanitizer((value) => {
      if (value === 'all') return 'all';
      return Number(value);
    })
    .default(1),

  query('order')
    .optional()
    .isIn(allowedSortFields)
    .withMessage(`El campo de orden debe ser uno de: ${allowedSortFields.join(', ')}`),

  query('asc')
    .optional()
    .isBoolean()
    .withMessage('asc debe ser un valor booleano')
    .toBoolean()
    .default(true),

  ...allowedFilters.map((filter) =>
    query(filter)
      .optional()
      .trim()
      .isString()
      .withMessage(`El filtro ${filter} debe ser una cadena de texto`)
      .escape(),
  ),
];
