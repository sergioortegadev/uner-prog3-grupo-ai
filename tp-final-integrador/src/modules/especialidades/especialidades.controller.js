import { matchedData } from 'express-validator';
import * as especialidadesService from './especialidades.service.js';
import { successResponse, errorResponse } from '../../helpers/response.helper.js';
import { ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Controlador de especialidades.
 */

export const getAll = async (req, res) => {
  const especialidades = await especialidadesService.getAllActive();
  return successResponse(res, especialidades);
};

export const getById = async (req, res) => {
  const { id } = matchedData(req);
  const especialidad = await especialidadesService.getEspecialidadById(id);

  if (!especialidad) {
    return errorResponse(res, 'Especialidad no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, especialidad);
};

export const createEspecialidad = async (req, res) => {
  const data = matchedData(req);
  const id = await especialidadesService.createEspecialidad(data);

  return successResponse(res, { id }, 201);
};

export const updateEspecialidad = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const success = await especialidadesService.updateEspecialidad(id, data);

  if (!success) {
    return errorResponse(res, 'Especialidad no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Especialidad actualizada correctamente' });
};

export const removeEspecialidad = async (req, res) => {
  const { id } = matchedData(req);
  const success = await especialidadesService.removeEspecialidad(id);

  if (!success) {
    return errorResponse(res, 'Especialidad no encontrada o ya eliminada', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Especialidad eliminada correctamente' });
};
