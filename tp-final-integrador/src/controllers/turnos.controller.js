import { matchedData } from 'express-validator';
import * as turnosService from '../services/turnos.service.js';
import { successResponse, paginatedResponse } from '../helpers/response.helper.js';

/**
 * Controlador para la gestión de turnos.
 */

export const createAppointment = async (req, res) => {
  const data = matchedData(req);
  const nuevoTurno = await turnosService.createAppointment(data, {
    id: req.user.id,
    role: req.user.rol,
  });

  return successResponse(res, nuevoTurno, 201);
};

export const getMyAppointments = async (req, res) => {
  const queryParams = matchedData(req, { locations: ['query'] });

  if (req.query.order === undefined) queryParams.order = 'fecha_hora';
  if (req.query.asc === undefined) queryParams.asc = false;

  const { data, total } = await turnosService.getMyAppointments(req.user, queryParams);
  return paginatedResponse(res, data, total, queryParams);
};

export const getStatistics = async (req, res) => {
  const { idPaciente } = matchedData(req, { locations: ['query'] });
  const statistics = await turnosService.getStatistics(idPaciente);

  return successResponse(res, statistics);
};

export const markAsAttended = async (req, res) => {
  const { id } = matchedData(req);
  const turnoActualizado = await turnosService.markAsAttended(id, req.user.id);

  return successResponse(res, turnoActualizado);
};
