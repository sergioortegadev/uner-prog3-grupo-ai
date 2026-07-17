import { matchedData } from 'express-validator';
import * as pacientesService from '../services/pacientes.service.ts';
import { errorResponse, successResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

/**
 * Controlador para el módulo de Pacientes
 */

export const getAll = async (req, res) => {
  const result = await pacientesService.getAll();
  return successResponse(res, result);
};

export const getById = async (req, res) => {
  const { id_paciente } = matchedData(req);
  const result = await pacientesService.getById(id_paciente);
  if (!result) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  return successResponse(res, result);
};

export const assignObraSocial = async (req, res) => {
  const { id_paciente, id_obra_social } = matchedData(req);
  const result = await pacientesService.assignObraSocial(id_paciente, id_obra_social);
  return successResponse(res, result);
};
