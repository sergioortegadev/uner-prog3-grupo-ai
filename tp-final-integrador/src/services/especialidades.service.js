import * as especialidadesModel from '../database/especialidades.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Lógica de negocio para especialidades.
 */

export const getAll = async (params) => {
  return await especialidadesModel.findAll(params);
};

export const createEspecialidad = async (data) => {
  // Validar que no exista una especialidad con el mismo nombre
  const existing = await especialidadesModel.findByName(data.nombre);
  if (existing) {
    const message =
      existing.activo === 0
        ? `Ya existe la especialidad '${data.nombre}' pero se encuentra inactiva. Debería reactivarla.`
        : 'Ya existe una especialidad con ese nombre';
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
  }

  return await especialidadesModel.create(data);
};

export const removeEspecialidad = async (id) => {
  return await especialidadesModel.softDelete(id);
};

export const updateEspecialidad = async (id, data) => {
  // Si se cambia el nombre, validar que no exista con ese nombre (excluyendo el actual)
  if (data.nombre) {
    const existing = await especialidadesModel.findByName(data.nombre);
    if (existing && existing.id !== id) {
      const message =
        existing.activo === 0
          ? `Ya existe la especialidad '${data.nombre}' pero se encuentra inactiva. No puede usar este nombre.`
          : 'Ya existe otra especialidad con ese nombre';
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
    }
  }

  return await especialidadesModel.update(id, data);
};

export const getEspecialidadById = async (id, onlyActive = true) => {
  return await especialidadesModel.findById(id, onlyActive);
};
