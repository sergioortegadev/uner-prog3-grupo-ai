import * as obrasSocialesModel from './obras_sociales.model.js';

/**
 * Lógica de negocio para obras sociales.
 */

export const getAll = async (params) => {
  return await obrasSocialesModel.findAll(params);
};

export const createObraSocial = async (data) => {
  return await obrasSocialesModel.create(data);
};

export const removeObraSocial = async (id) => {
  return await obrasSocialesModel.softDelete(id);
};

export const updateObraSocial = async (id, data) => {
  return await obrasSocialesModel.update(id, data);
};

export const getObraSocialById = async (id, onlyActive = true) => {
  return await obrasSocialesModel.findById(id, onlyActive);
};
