import { matchedData } from 'express-validator';
import * as obrasSocialesService from '../services/obras_sociales.service.ts';
import { successResponse, errorResponse, paginatedResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

/**
 * Controlador de obras sociales.
 * No requiere try/catch gracias a Express 5+
 * No requiere validar req gracias al validateRequest middleware
 */

export const getAll = async (req, res) => {
  const queryParams = matchedData(req, { locations: ['query'] });
  const { data, total } = await obrasSocialesService.getAll(queryParams);
  return paginatedResponse(res, data, total, queryParams);
};

export const getById = async (req, res) => {
  const { id } = matchedData(req);
  // Por defecto solo buscamos obras sociales activas.
  const obraSocial = await obrasSocialesService.getObraSocialById(id);

  if (!obraSocial) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, obraSocial);
};

export const createObraSocial = async (req, res) => {
  const data = matchedData(req);
  const id = await obrasSocialesService.createObraSocial(data);
  const nuevaObraSocial = await obrasSocialesService.getObraSocialById(id);

  return successResponse(res, nuevaObraSocial, 201);
};

export const updateObraSocial = async (req, res) => {
  const { id, ...data } = matchedData(req);
  const success = await obrasSocialesService.updateObraSocial(id, data);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Obra social no encontrada',
    });
  }

  return successResponse(res, { message: 'Obra social actualizada correctamente' });
};

export const removeObraSocial = async (req, res) => {
  const { id } = matchedData(req);
  const success = await obrasSocialesService.removeObraSocial(id);

  if (!success) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.NOT_FOUND,
      message: 'Obra social no encontrada o ya eliminada',
    });
  }

  return successResponse(res, { message: 'Obra social eliminada correctamente' });
};
