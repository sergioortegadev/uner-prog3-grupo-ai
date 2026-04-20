import { matchedData } from 'express-validator';
import * as obrasSocialesService from './obras_sociales.service.js';
import { successResponse, errorResponse } from '../../helpers/response.helper.js';
import { ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Controlador de obras sociales.
 * No requiere try/catch gracias a Express 5+
 * No requiere validar req gracias al validateRequest middleware
 */

export const getAll = async (req, res) => {
  const obrasSociales = await obrasSocialesService.getAllActive();
  return successResponse(res, obrasSociales);
};

export const getById = async (req, res) => {
  const { id } = matchedData(req);
  const obraSocial = await obrasSocialesService.getObraSocialById(id);

  if (!obraSocial) {
    return errorResponse(res, 'Obra social no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, obraSocial);
};

export const createObraSocial = async (req, res) => {
  const data = matchedData(req);
  const id = await obrasSocialesService.createObraSocial(data);

  return successResponse(res, { id }, 201);
};

export const updateObraSocial = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const success = await obrasSocialesService.updateObraSocial(id, data);

  if (!success) {
    return errorResponse(res, 'Obra social no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Obra social actualizada correctamente' });
};

export const removeObraSocial = async (req, res) => {
  const { id } = matchedData(req);
  const success = await obrasSocialesService.removeObraSocial(id);

  if (!success) {
    return errorResponse(res, 'Obra social no encontrada o ya eliminada', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Obra social eliminada correctamente' });
};
