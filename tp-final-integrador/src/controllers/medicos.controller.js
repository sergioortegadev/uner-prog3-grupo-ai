import * as medicosService from '../services/medicos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para el módulo de Médicos
 */

export const asociarObrasSociales = async (req, res, next) => {
  try {
    const { id_medico } = req.params;
    const { obrasSociales } = req.body;

    const result = await medicosService.asociarObrasSociales(Number(id_medico), obrasSociales);

    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};
