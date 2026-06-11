import * as turnosModel from '../database/turnos.js';
import * as medicosModel from '../database/medicos.js';
import * as pacientesModel from '../database/pacientes.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import { findActiveOrThrow } from '../helpers/entity.helper.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';
import { DB_STATUS, ATTENDED_STATUS } from '../constants/common.constants.js';
import { ROLES } from '../constants/roles.constants.js';
import { pdfGenerator } from '../helpers/pdfGenerator.helper.js';

/**
 * Obtiene los turnos propios del usuario según su rol.
 */
export const getMyAppointments = async (usuario, queryParams = {}) => {
  if (usuario.rol === ROLES.MEDICO) {
    const medico = await ensureDoctorExistsAndIsActive(usuario.id, true);
    return await turnosModel.findByDoctorId(medico.idMedico, queryParams);
  }

  if (usuario.rol === ROLES.PACIENTE) {
    const paciente = await ensurePatientExistsAndIsActive(usuario.id, true);
    return await turnosModel.findByPatientId(paciente.idPaciente, queryParams);
  }

  throw new AppError(
    ERROR_CODES.FORBIDDEN,
    'El rol del usuario no tiene permisos para esta acción',
  );
};

/**
 * Registra un nuevo turno con cálculo de valor_total.
 */
export const createAppointment = async (data, { id, role }) => {
  if (role === ROLES.PACIENTE) {
    const pacientePerfil = await ensurePatientExistsAndIsActive(id, true);
    data.idPaciente = pacientePerfil.idPaciente;
    data.idObraSocial = pacientePerfil.idObraSocial ?? pacientePerfil.obraSocial?.id;
  }

  const { idMedico, idPaciente, idObraSocial, fecha, hora } = data;

  const medico = await ensureDoctorExistsAndIsActive(idMedico);
  const paciente = await ensurePatientExistsAndIsActive(idPaciente);
  const obraSocial = await ensureObraSocialExistsAndIsActive(idObraSocial);

  ensurePatientMatchesObraSocial(paciente, obraSocial);
  await ensureDoctorAcceptsObraSocial(idMedico, obraSocial);

  const valorTotal = calculateFinalPrice(medico, obraSocial);
  const fechaHora = `${fecha} ${hora}`;

  await ensureNoOverlappingAppointments(idMedico, idPaciente, fechaHora);

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
 */
export const markAsAttended = async (idTurno, idUsuario) => {
  const medico = await ensureDoctorExistsAndIsActive(idUsuario, true);
  const turno = await ensureAppointmentExists(idTurno);

  ensureDoctorOwnsAppointment(turno, medico.idMedico);
  ensureAppointmentIsActive(turno);
  ensureNotAlreadyAttended(turno);
  ensureAppointmentHasOccurred(turno);

  await turnosModel.updateAttended(idTurno, ATTENDED_STATUS.ATTENDED);

  return {
    id: idTurno,
    atendido: true,
    fechaHora: turno.fechaHora,
  };
};

export const getStatistics = async (idPaciente = null) => {
  return await turnosModel.getStatistics(idPaciente);
};

export const getStatisticsPDFMedicos = async () => {
  const estadisticas = await turnosModel.getStatisticsMedicos();
  const pdfBuffer = await pdfGenerator(estadisticas.turnosPorMedico, 'reporteMedicos');

  return {
    buffer: pdfBuffer,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=reporte-medicos.pdf',
    },
  };
};

export const getStatisticsPDFFecha = async () => {
  const estadisticas = await turnosModel.getStatisticsFecha();
  const pdfBuffer = await pdfGenerator(estadisticas.turnosPorFecha, 'reporteFecha');

  return {
    buffer: pdfBuffer,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=reporte-medicos.pdf',
    },
  };
};
export const getStatisticsPDFEspecialidad = async () => {
  const estadisticas = await turnosModel.getStatisticsEspecialidad();

  const pdfBuffer = await pdfGenerator(estadisticas.turnosPorEspecialidad, 'reporteEspecialidad');

  return {
    buffer: pdfBuffer,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=reporte-medicos.pdf',
    },
  };
};
export const getStatisticsPDFPaciente = async (idPaciente) => {
  const estadisticas = await turnosModel.getStatisticsPaciente(idPaciente);

  const patienceSubtitle = `Del paciente: ${estadisticas.turnosPacienteUltimoAnio[0].paciente}. Con ID: ${estadisticas.turnosPacienteUltimoAnio[0].idPaciente}`;

  const pdfBuffer = await pdfGenerator(
    estadisticas.turnosPacienteUltimoAnio,
    'reportePaciente',
    patienceSubtitle,
  );

  return {
    buffer: pdfBuffer,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=reporte-medicos.pdf',
    },
  };
};

// --- Helpers de validación y lógica interna ---

const ensureDoctorExistsAndIsActive = async (id, isUserId = false) => {
  const findFn = isUserId ? medicosModel.findByUserId : medicosModel.findById;
  return await findActiveOrThrow(findFn, id, {
    notFoundMessage: isUserId ? 'Perfil de médico no encontrado' : 'El médico solicitado no existe',
    inactiveMessage: 'El médico solicitado no se encuentra activo',
  });
};

const ensurePatientExistsAndIsActive = async (id, isUserId = false) => {
  const findFn = isUserId ? pacientesModel.findByUserId : pacientesModel.findById;
  return await findActiveOrThrow(findFn, id, {
    notFoundMessage: isUserId
      ? 'Perfil de paciente no encontrado'
      : 'El paciente solicitado no existe',
    inactiveMessage: 'El paciente solicitado no se encuentra activo',
  });
};

const ensureObraSocialExistsAndIsActive = async (id) => {
  return await findActiveOrThrow((id) => obrasSocialesModel.findById(id, false), id, {
    notFoundMessage: 'La obra social solicitada no existe',
    inactiveMessage: 'La obra social solicitada no se encuentra activa',
  });
};

const ensurePatientMatchesObraSocial = (paciente, obraSocial) => {
  const idObraSocialPaciente = paciente.obraSocial?.id || null;
  if (!obraSocial.esParticular && idObraSocialPaciente !== obraSocial.id) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'La obra social del turno no coincide con la del paciente',
    );
  }
};

const ensureDoctorAcceptsObraSocial = async (idMedico, obraSocial) => {
  if (!obraSocial.esParticular) {
    const aceptaObraSocial = await medicosModel.acceptsObraSocial(idMedico, obraSocial.id);
    if (!aceptaObraSocial) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'El médico solicitado no trabaja con la obra social especificada',
      );
    }
  }
};

const ensureNoOverlappingAppointments = async (idMedico, idPaciente, fechaHora) => {
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
};

const ensureAppointmentExists = async (idTurno) => {
  const turno = await turnosModel.findById(idTurno);
  if (!turno) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El turno solicitado no existe');
  }
  return turno;
};

const ensureDoctorOwnsAppointment = (turno, idMedico) => {
  if (turno.medico.id !== idMedico) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      'No tiene permisos para marcar este turno como atendido',
    );
  }
};

const ensureAppointmentIsActive = (turno) => {
  if (!turno.activo) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'No se puede marcar como atendido un turno inactivo o cancelado',
    );
  }
};

const ensureNotAlreadyAttended = (turno) => {
  if (turno.atendido) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El turno ya ha sido marcado como atendido');
  }
};

const ensureAppointmentHasOccurred = (turno) => {
  const fechaTurno = new Date(turno.fechaHora);
  if (fechaTurno > new Date()) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'No se puede marcar como atendido un turno que aún no ha ocurrido',
    );
  }
};

const calculateFinalPrice = (medico, obraSocial) => {
  let valorTotal = Number(medico.valorConsulta);
  if (!obraSocial.esParticular) {
    const descuento = valorTotal * Number(obraSocial.porcentajeDescuento);
    valorTotal -= descuento;
  }
  return valorTotal;
};
