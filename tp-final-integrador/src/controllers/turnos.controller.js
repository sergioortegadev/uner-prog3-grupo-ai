import { matchedData } from 'express-validator';
import * as turnosService from '../services/turnos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para la gestión de turnos.
 */

export const registrarTurno = async (req, res) => {
  const data = matchedData(req);
  const nuevoTurno = await turnosService.registrarTurno(data);

  return successResponse(res, nuevoTurno, 201);
};

export const listarTurnosPropios = async (req, res) => {
  const turnos = await turnosService.listarTurnosPropios(req.user);
  return successResponse(res, turnos);
};
