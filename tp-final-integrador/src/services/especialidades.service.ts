import { DB_STATUS } from '../constants/common.constants.ts';
import * as especialidadesModel from '../database/especialidades.ts';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.ts';

// Lógica de negocio para Especialidades

export const getAll = async (params) => {
  return await especialidadesModel.findAll(params);
};

export const getById = async (id) => {
  return await especialidadesModel.findById(id);
};

export const createEspecialidad = async (data) => {
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

export const updateEspecialidad = async (id, data) => {
  // 1. Validar que la especialidad exista
  const current = await especialidadesModel.findById(id, false);
  if (!current) return false;

  // 2. Si el nombre es exactamente el mismo, no hacemos nada y retornamos éxito (Idempotencia)
  if (data.nombre && data.nombre.trim().toLowerCase() === current.nombre.toLowerCase()) {
    return true;
  }

  // 3. Si se cambia el nombre, validar que no exista con ese nombre
  if (data.nombre) {
    const existing = await especialidadesModel.findByName(data.nombre);
    if (existing) {
      const message =
        existing.activo === DB_STATUS.INACTIVE
          ? `Ya existe la especialidad '${data.nombre}' pero se encuentra inactiva. No puede usar este nombre.`
          : 'Ya existe otra especialidad con ese nombre';
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
    }
  }
  return await especialidadesModel.update(id, data);
};

export const deleteEspecialidad = async (id) => {
  const current = await especialidadesModel.findById(id, true);
  if (!current) return false;
  return await especialidadesModel.softDelete(id);
};
