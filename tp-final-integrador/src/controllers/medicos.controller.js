import { matchedData } from 'express-validator';
import * as medicosService from '../services/medicos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para el módulo de Médicos
 */

export const asociarObrasSociales = async (req, res) => {
  const { id_medico, obrasSociales } = matchedData(req);

  const result = await medicosService.asociarObrasSociales(id_medico, obrasSociales);
  const status = result.asociadas.length > 0 ? 201 : 200;

  return successResponse(res, result, status);
};
