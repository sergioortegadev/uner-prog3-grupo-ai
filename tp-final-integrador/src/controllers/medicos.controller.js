import { matchedData } from 'express-validator';
import * as medicosService from '../services/medicos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para el módulo de Médicos
 */

export const asociarObrasSociales = async (req, res, next) => {
  try {
    const { id_medico, obrasSociales } = matchedData(req);

    const result = await medicosService.asociarObrasSociales(id_medico, obrasSociales);

    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};
