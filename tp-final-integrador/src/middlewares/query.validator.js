import { query } from 'express-validator';
import { QUERY_PARAMS, DB_STATUS } from '../constants/common.constants.js';

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
    .default(QUERY_PARAMS.DEFAULT_LIMIT),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número entero no negativo')
    .toInt()
    .default(QUERY_PARAMS.DEFAULT_OFFSET),

  query('activo')
    .optional()
    .custom((value) => {
      if (
        value === DB_STATUS.ALL ||
        value === DB_STATUS.INACTIVE ||
        value === DB_STATUS.ACTIVE ||
        value === String(DB_STATUS.INACTIVE) ||
        value === String(DB_STATUS.ACTIVE)
      ) {
        return true;
      }
      throw new Error(
        `El param "activo" debe ser ${DB_STATUS.INACTIVE}, ${DB_STATUS.ACTIVE} o "${DB_STATUS.ALL}"`,
      );
    })
    .customSanitizer((value) => {
      if (value === DB_STATUS.ALL) return DB_STATUS.ALL;
      return Number(value);
    })
    .default(DB_STATUS.ACTIVE),

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
