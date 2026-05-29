import { matchedData } from 'express-validator';
import * as especialidadesService from '../services/especialidades.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Controlador de especialidades.
 */

export const getAll = async (req, res) => {
  const queryParams = matchedData(req, { locations: ['query'] });
  const { data, total } = await especialidadesService.getAll(queryParams);
  return paginatedResponse(res, data, total, queryParams);
};

export const getById = async (req, res) => {
  const { id } = matchedData(req);
  const especialidad = await especialidadesService.getEspecialidadById(id, req.user?.rol);

  if (!especialidad) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, especialidad);
};

export const createEspecialidad = async (req, res) => {
  const data = matchedData(req);
  const id = await especialidadesService.createEspecialidad(data);
  const nuevaEspecialidad = await especialidadesService.getEspecialidadById(id);

  return successResponse(res, nuevaEspecialidad, 201);
};

export const updateEspecialidad = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const success = await especialidadesService.updateEspecialidad(id, data);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Especialidad no encontrada o inactiva',
    });
  }

  return successResponse(res, { message: 'Especialidad actualizada correctamente' });
};

export const removeEspecialidad = async (req, res) => {
  const { id } = matchedData(req);
  const success = await especialidadesService.removeEspecialidad(id);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Especialidad no encontrada o ya eliminada',
    });
  }

  return successResponse(res, { message: 'Especialidad eliminada correctamente' });
};
