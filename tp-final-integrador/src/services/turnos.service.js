import * as turnosModel from '../database/turnos.js';
import * as medicosModel from '../database/medicos.js';
import * as pacientesModel from '../database/pacientes.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import { findActiveOrThrow } from '../helpers/entity.helper.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';
import { DB_STATUS } from '../constants/common.constants.js';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Obtiene los turnos propios del usuario según su rol.
 * @param {Object} usuario - El usuario autenticado (extraído de req.user).
 * @param {Object} queryParams - Parámetros opcionales de paginación ({ limit, offset }).
 * @returns {Promise<{data: Object[], total: number}>} Lista de turnos con total.
 */
export const getMyAppointments = async (usuario, queryParams = {}) => {
  if (usuario.rol === ROLES.MEDICO) {
    const medico = await findActiveOrThrow(medicosModel.findByUserId, usuario.id, {
      notFoundMessage: 'Perfil de médico no encontrado',
      inactiveMessage: 'El médico solicitado no se encuentra activo',
    });
    return await turnosModel.findByDoctorId(medico.idMedico, queryParams);
  }

  if (usuario.rol === ROLES.PACIENTE) {
    const paciente = await findActiveOrThrow(pacientesModel.findByUserId, usuario.id, {
      notFoundMessage: 'Perfil de paciente no encontrado',
      inactiveMessage: 'El paciente solicitado no se encuentra activo',
    });
    return await turnosModel.findByPatientId(paciente.idPaciente, queryParams);
  }

  throw new AppError(
    ERROR_CODES.FORBIDDEN,
    'El rol del usuario no tiene permisos para esta acción',
  );
};

/**
 * Registra un nuevo turno con cálculo de valor_total.
 * @param {Object} data - Datos del turno (idMedico, idPaciente, idObraSocial, fecha, hora).
 * @param {Object} context - Contexto del usuario que realiza la acción ({ id, role }).
 * @returns {Promise<Object>} Datos del turno creado.
 */
export const createAppointment = async (data, { id, role }) => {
  if (role === ROLES.PACIENTE) {
    const pacientePerfil = await pacientesModel.findByUserId(id);

    if (!pacientePerfil) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'Perfil de paciente no encontrado');
    }

    // Sobrescribimos los IDs con los del perfil del paciente
    data.idPaciente = pacientePerfil.idPaciente;
    data.idObraSocial = pacientePerfil.idObraSocial;
  }

  const { idMedico, idPaciente, idObraSocial, fecha, hora } = data;

  const medico = await findActiveOrThrow(medicosModel.findById, idMedico, {
    notFoundMessage: 'El médico solicitado no existe',
    inactiveMessage: 'El médico solicitado no se encuentra activo',
  });

  const paciente = await findActiveOrThrow(pacientesModel.findById, idPaciente, {
    notFoundMessage: 'El paciente solicitado no existe',
    inactiveMessage: 'El paciente solicitado no se encuentra activo',
  });

  const obraSocial = await findActiveOrThrow(
    (id) => obrasSocialesModel.findById(id, false),
    idObraSocial,
    {
      notFoundMessage: 'La obra social solicitada no existe',
      inactiveMessage: 'La obra social solicitada no se encuentra activa',
    },
  );

  if (!obraSocial.esParticular && paciente.idObraSocial !== idObraSocial) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'La obra social del turno no coincide con la del paciente',
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

  const pacienteTieneTurno = await turnosModel.checkPatientOverlap(idPaciente, fechaHora);
  if (pacienteTieneTurno) {
    throw new AppError(
      ERROR_CODES.DUPLICATE_ENTRY,
      'El paciente ya tiene un turno reservado para la misma fecha y hora',
    );
  }

  const medicoTieneTurno = await turnosModel.existsByDoctorAndDateTime(idMedico, fechaHora);
  if (medicoTieneTurno) {
    throw new AppError(
      ERROR_CODES.DUPLICATE_ENTRY,
      'El médico ya tiene un turno reservado para la misma fecha y hora',
    );
  }

  const idTurno = await turnosModel.create({
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
  });

  if (!idTurno) {
    throw new AppError(
      ERROR_CODES.DUPLICATE_ENTRY,
      'No se pudo reservar el turno. El médico o el paciente ya tienen un compromiso en ese horario.',
    );
  }

  return {
    idTurno,
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
    atendido: false,
    activo: DB_STATUS.ACTIVE,
  };
};

/**
 * Marca un turno como atendido.
 * @param {number} idTurno
 * @param {number} idUsuario - ID del usuario médico que realiza la acción.
 * @returns {Promise<Object>} Datos del turno actualizado.
 */
export const markAsAttended = async (idTurno, idUsuario) => {
  const medico = await findActiveOrThrow(medicosModel.findByUserId, idUsuario, {
    notFoundMessage: 'Perfil de médico no encontrado',
    inactiveMessage: 'El médico solicitado no se encuentra activo',
  });

  const turno = await turnosModel.findById(idTurno);

  if (!turno) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El turno solicitado no existe');
  }

  if (turno.medico.id !== medico.idMedico) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'No tiene permisos para marcar este turno como atendido',
    );
  }

  if (!turno.activo) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'No se puede marcar como atendido un turno inactivo o cancelado',
    );
  }

  if (turno.atendido) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El turno ya ha sido marcado como atendido');
  }

  const fechaTurno = new Date(turno.fechaHora);
  const ahora = new Date();
  if (fechaTurno > ahora) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'No se puede marcar como atendido un turno que aún no ha ocurrido',
    );
  }

  await turnosModel.updateAttended(idTurno, 1);

  return {
    id: idTurno,
    atendido: true,
    fechaHora: turno.fechaHora,
  };
};
