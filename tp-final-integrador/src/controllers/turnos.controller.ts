import { matchedData } from 'express-validator';
import * as turnosService from '../services/turnos.service.ts';
import { successResponse, paginatedResponse } from '../helpers/response.helper.ts';

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

export const getStatisticsPDFMedicos = async (req, res) => {
  const { buffer, headers } = await turnosService.getStatisticsPDFMedicos();

  res.set(headers);
  res.status(200).end(buffer);
};

export const getStatisticsPDFFecha = async (req, res) => {
  const { buffer, headers } = await turnosService.getStatisticsPDFFecha();

  res.set(headers);
  res.status(200).end(buffer);
};

export const getStatisticsPDFEspecialidad = async (req, res) => {
  const { buffer, headers } = await turnosService.getStatisticsPDFEspecialidad();

  res.set(headers);
  res.status(200).end(buffer);
};

export const getStatisticsPDFPaciente = async (req, res) => {
  const { id_paciente } = matchedData(req, { locations: ['params'] });

  const { buffer, headers } = await turnosService.getStatisticsPDFPaciente(id_paciente);

  res.set(headers);
  res.status(200).end(buffer);
};

export const markAsAttended = async (req, res) => {
  const { id } = matchedData(req);
  const turnoActualizado = await turnosService.markAsAttended(id, req.user.id);

  return successResponse(res, turnoActualizado);
};
