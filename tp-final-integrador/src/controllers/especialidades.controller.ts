import { matchedData } from 'express-validator';
import { successResponse, errorResponse, paginatedResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';
import * as especialidadesService from '../services/especialidades.service.ts';
import * as medicosService from '../services/medicos.service.ts';
import { DB_STATUS } from '../constants/common.constants.ts';
import { ROLES } from '../constants/roles.constants.ts';

export const getAll = async (req, res) => {
  const queryParams = matchedData(req, { locations: ['query'] });
  if (req.user.rol !== ROLES.ADMIN) {
    queryParams.activo = DB_STATUS.ACTIVE;
  }
  const { data, total } = await especialidadesService.getAll(queryParams);
  return paginatedResponse(res, data, total, queryParams, 200);
};

export const getById = async (req, res) => {
  const { id } = matchedData(req);
  const especialidad = await especialidadesService.getById(id);

  if (!especialidad) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, especialidad);
};

export const createEspecialidad = async (req, res) => {
  const data = matchedData(req);
  const id = await especialidadesService.createEspecialidad(data);
  const nuevaEspecialidad = await especialidadesService.getById(id);
  return successResponse(res, nuevaEspecialidad, 201);
};

export const updateEspecialidad = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const success = await especialidadesService.updateEspecialidad(id, data);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Especialidad no encontrada',
    });
  }

  return successResponse(res, { message: 'Especialidad actualizada correctamente' });
};

export const deleteEspecialidad = async (req, res) => {
  const { id } = matchedData(req);
  const success = await especialidadesService.deleteEspecialidad(id);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Especialidad no encontrada o ya eliminada',
    });
  }

  return successResponse(res, { message: 'Especialidad eliminada correctamente' });
};

export const getMedicosByEspecialidad = async (req, res) => {
  const { id } = matchedData(req);
  const result = await medicosService.obtenerPorEspecialidad(id);

  return successResponse(res, result, 200);
};
