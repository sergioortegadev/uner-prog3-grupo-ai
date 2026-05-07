import * as obrasSocialesModel from '../database/obras_sociales.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Lógica de negocio para obras sociales.
 */

export const getAll = async (params) => {
  return await obrasSocialesModel.findAll(params);
};

export const createObraSocial = async (data) => {
  //  Validar que no exista una obra social con el mismo nombre
  const alreadyExist = await obrasSocialesModel.findByName(data.nombre);
  if (alreadyExist) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una obra social con ese nombre');
  }

  return await obrasSocialesModel.create(data);
};

export const removeObraSocial = async (id) => {
  return await obrasSocialesModel.softDelete(id);
};

export const updateObraSocial = async (id, data) => {
  //  Si se cambia el nombre, validar que no exista con ese nombre (excluyendo el actual)
  if (data.nombre) {
    const existing = await obrasSocialesModel.findByName(data.nombre);
    if (existing && existing.id !== id) {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe otra obra social con ese nombre');
    }
  }

  return await obrasSocialesModel.update(id, data);
};

export const getObraSocialById = async (id, onlyActive = true) => {
  return await obrasSocialesModel.findById(id, onlyActive);
};
