import * as especialidadesModel from './especialidades.model.js';

/**
 * Lógica de negocio para especialidades.
 */

export const getAllActive = async () => {
  return await especialidadesModel.findAllActive();
};

export const createEspecialidad = async (data) => {
  return await especialidadesModel.create(data);
};

export const removeEspecialidad = async (id) => {
  return await especialidadesModel.softDelete(id);
};

export const updateEspecialidad = async (id, data) => {
  return await especialidadesModel.update(id, data);
};

export const getEspecialidadById = async (id) => {
  return await especialidadesModel.findById(id);
};
