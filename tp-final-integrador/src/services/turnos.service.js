import * as turnosModel from '../database/turnos.js';
import * as medicosModel from '../database/medicos.js';
import * as pacientesModel from '../database/pacientes.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';
import { DB_STATUS } from '../constants/common.constants.js';

/**
 * Registra un nuevo turno con cálculo de valor_total.
 * @param {Object} data - Datos del turno (idMedico, idPaciente, idObraSocial, fecha, hora).
 * @returns {Promise<Object>} Datos del turno creado.
 */
export const registrarTurno = async (data) => {
  const { idMedico, idPaciente, idObraSocial, fecha, hora } = data;

  const medico = await medicosModel.findById(idMedico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El médico solicitado no existe');
  }
  if (!medico.activo) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'El médico solicitado no se encuentra activo');
  }

  const paciente = await pacientesModel.findById(idPaciente);
  if (!paciente) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El paciente solicitado no existe');
  }
  if (!paciente.activo) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'El paciente solicitado no se encuentra activo',
    );
  }

  if (paciente.idObraSocial !== idObraSocial) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'La obra social del turno no coincide con la del paciente',
    );
  }

  const obraSocial = await obrasSocialesModel.findById(idObraSocial, false);
  if (!obraSocial) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'La obra social solicitada no existe');
  }
  if (!obraSocial.activo) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'La obra social solicitada no se encuentra activa',
    );
  }

  if (!obraSocial.esParticular) {
    const aceptaObraSocial = await medicosModel.acceptsObraSocial(idMedico, idObraSocial);
    if (!aceptaObraSocial) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'El médico solicitado no trabaja con la obra social especificada',
      );
    }
  }

  let valorTotal = Number(medico.valorConsulta);

  if (!obraSocial.esParticular) {
    const descuento = valorTotal * Number(obraSocial.porcentajeDescuento);
    valorTotal = valorTotal - descuento;
  }

  const fechaHora = `${fecha} ${hora}`;

  const medicoTieneTurno = await turnosModel.existsByMedicoAndFechaHora(idMedico, fechaHora);
  if (medicoTieneTurno) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'El médico ya tiene un turno reservado para la misma fecha y hora',
    );
  }

  const pacienteTieneTurno = await turnosModel.checkPatientOverlap(idPaciente, fechaHora);
  if (pacienteTieneTurno) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'El paciente ya tiene un turno reservado para la misma fecha y hora',
    );
  }

  const idTurno = await turnosModel.create({
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
  });

  return {
    idTurno,
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
    atendido: 0,
    activo: DB_STATUS.ACTIVE,
  };
};
