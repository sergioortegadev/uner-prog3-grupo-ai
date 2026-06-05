import { matchedData } from 'express-validator';
import * as turnosService from '../services/turnos.service.js';
import { successResponse } from '../helpers/response.helper.js';

/**
 * Controlador para la gestión de turnos.
 */

export const registrarTurno = async (req, res) => {
  const data = matchedData(req);
  const nuevoTurno = await turnosService.registrarTurno(data, {
    id: req.user.id,
    role: req.user.rol,
  });

  return successResponse(res, nuevoTurno, 201);
};

export const listarTurnosPropios = async (req, res) => {
  const turnos = await turnosService.listarTurnosPropios(req.user);
  return successResponse(res, turnos);
};

export const marcarComoAtendido = async (req, res) => {
  const { id } = matchedData(req);
  const turnoActualizado = await turnosService.marcarComoAtendido(id, req.user.id);

  return successResponse(res, turnoActualizado);
};
