import { matchedData } from 'express-validator';
import * as pacientesService from '../services/pacientes.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para el módulo de Pacientes
 */

export const getAll = async (req, res) => {
  //const { id_medico, obrasSociales } = matchedData(req);

  const result = await pacientesService.getAll();
  //const status = result.asociadas.length > 0 ? 201 : 200;

  return successResponse(res, result /*, status*/);
};

export const getById = async (req, res) => {
  const { id_paciente } = matchedData(req);

  const result = await pacientesService.getById(id_paciente);
  //const status = result.asociadas.length > 0 ? 201 : 200;

  return successResponse(res, result);
  //return successResponse(res, result /*, status*/);
};

export const assignObraSocial = async (req, res) => {
  const { id_paciente, id_obra_social } = matchedData(req);

  const result = await pacientesService.assignObraSocial(id_paciente, id_obra_social);
  //const status = result.asociadas.length > 0 ? 201 : 200;

  return successResponse(res, result /*, status*/);
};
