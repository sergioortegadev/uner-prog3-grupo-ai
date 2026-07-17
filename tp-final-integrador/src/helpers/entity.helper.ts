import { AppError, ERROR_CODES } from './errors.helper.ts';

/**
 * Helper para buscar una entidad por ID y validar que exista y esté activa.
 * @param {Function} findFn - Función async que recibe el ID y retorna la entidad o null.
 * @param {*} id - El ID a buscar.
 * @param {Object} messages - Mensajes de error personalizados.
 * @param {string} messages.notFoundMessage
 * @param {string} messages.inactiveMessage
 * @returns {Promise<Object>} La entidad encontrada y activa.
 */
export const findActiveOrThrow = async (findFn, id, { notFoundMessage, inactiveMessage }) => {
  const entity = await findFn(id);
  if (!entity) {
    throw new AppError(ERROR_CODES.NOT_FOUND, notFoundMessage);
  }
  if (!entity.activo) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, inactiveMessage);
  }
  return entity;
};
