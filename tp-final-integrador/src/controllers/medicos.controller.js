import { matchedData } from 'express-validator';
import * as medicosService from '../services/medicos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para el módulo de Médicos
 */

export const assignObrasSociales = async (req, res) => {
  const { idMedico, obrasSociales } = matchedData(req);

  const result = await medicosService.assignObrasSociales(idMedico, obrasSociales);
  const status = result.asociadas.length > 0 ? 201 : 200;

  return successResponse(res, result, status);
};

/**
 * Obtiene el listado de todos los médicos.
 */
export const obtenerTodos = async (req, res) => {
  const result = await medicosService.obtenerTodos();

  return successResponse(res, result, 200);
};

/**
 * Modifica especialidad de médicos.
 */
export const updateEspecialidad = async (req, res) => {
  const { idMedico, idEspecialidad } = matchedData(req);

  const result = await medicosService.updateEspecialidad(idMedico, idEspecialidad);

  return successResponse(res, {
    message: 'Especialidad actualizada correctamente',
    ...result,
  });
};
