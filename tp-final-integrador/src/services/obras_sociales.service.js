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
  const existing = await obrasSocialesModel.findByName(data.nombre);
  if (existing) {
    const message =
      existing.activo === 0
        ? `Ya existe la obra social '${data.nombre}' pero se encuentra inactiva. Debería reactivarla.`
        : 'Ya existe una obra social con ese nombre';
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
  }

  return await obrasSocialesModel.create(data);
};

export const removeObraSocial = async (id) => {
  // 1. Validar que la obra social exista y esté activa antes de borrar
  const current = await obrasSocialesModel.findById(id, true);
  if (!current) return false;

  return await obrasSocialesModel.softDelete(id);
};

export const updateObraSocial = async (id, data) => {
  // 1. Validar que la obra social exista (independientemente de si está activa o no, para permitir reactivación)
  const current = await obrasSocialesModel.findById(id, false);
  if (!current) return false;

  // 2. Si se cambia el nombre, validar que no exista con ese nombre (excluyendo el actual)
  if (data.nombre && data.nombre.toLowerCase() !== current.nombre.toLowerCase()) {
    const existing = await obrasSocialesModel.findByName(data.nombre);
    if (existing) {
      const message =
        existing.activo === 0
          ? `Ya existe la obra social '${data.nombre}' pero se encuentra inactiva. No puede usar este nombre.`
          : 'Ya existe otra obra social con ese nombre';
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
    }
  }

  return await obrasSocialesModel.update(id, data);
};

export const getObraSocialById = async (id, onlyActive = true) => {
  return await obrasSocialesModel.findById(id, onlyActive);
};
