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
  const { id } = req.params;
  const obraSocial = await obrasSocialesService.getObraSocialById(id);

  if (!obraSocial) {
    return errorResponse(res, 'Obra social no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, obraSocial);
};

export const createObraSocial = async (req, res) => {
  const { nombre, descripcion, porcentajeDescuento, esParticular } = req.body;
  const id = await obrasSocialesService.createObraSocial({
    nombre,
    descripcion,
    porcentajeDescuento,
    esParticular,
  });

  return successResponse(res, { id }, 201);
};

export const updateObraSocial = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, porcentajeDescuento, esParticular } = req.body;
  const success = await obrasSocialesService.updateObraSocial(id, {
    nombre,
    descripcion,
    porcentajeDescuento,
    esParticular,
  });

  if (!success) {
    return errorResponse(res, 'Obra social no encontrada o inactiva', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Obra social actualizada correctamente' });
};

export const removeObraSocial = async (req, res) => {
  const { id } = req.params;
  const success = await obrasSocialesService.removeObraSocial(id);

  if (!success) {
    return errorResponse(res, 'Obra social no encontrada o ya eliminada', ERROR_CODES.NOT_FOUND);
  }

  return successResponse(res, { message: 'Obra social eliminada correctamente' });
};
