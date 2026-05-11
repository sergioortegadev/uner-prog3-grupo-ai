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
  const alreadyExist = await especialidadesModel.findByName(data.nombre);
  if (alreadyExist) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una especialidad con ese nombre');
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
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe otra especialidad con ese nombre');
    }
  }

  return await especialidadesModel.update(id, data);
};

export const getEspecialidadById = async (id, onlyActive = true) => {
  return await especialidadesModel.findById(id, onlyActive);
};
