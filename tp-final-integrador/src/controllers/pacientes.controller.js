//import { matchedData } from 'express-validator';
//import * as medicosService from '../services/medicos.service.js';
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
