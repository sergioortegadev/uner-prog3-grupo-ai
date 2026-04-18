import { matchedData } from 'express-validator';
import * as medicosService from './medicos.service.js';
import { successResponse } from '../../helpers/response.helper.js';

/**
 * Controladores para el módulo de médicos.
 */

export const getMedicos = async (req, res) => {
  const { especialidad } = matchedData(req);
  const medicos = await medicosService.listarMedicos(especialidad);
  return successResponse(res, medicos);
};

export const updateEspecialidad = async (req, res) => {
  const { id } = req.params;
  const { id_especialidad } = matchedData(req);
  await medicosService.actualizarEspecialidad(id, id_especialidad);
  return successResponse(res, { message: 'Especialidad actualizada correctamente' });
};

export const addObraSocial = async (req, res) => {
  const { id } = req.params;
  const { id_obra_social } = matchedData(req);
  await medicosService.asociarObraSocial(id, id_obra_social);
  return successResponse(res, { message: 'Obra social asociada correctamente' }, 201);
};

export const removeObraSocial = async (req, res) => {
  const { id, id_obra_social } = req.params;
  await medicosService.desvincularObraSocial(id, id_obra_social);
  return successResponse(res, { message: 'Obra social desvinculada correctamente' });
};
