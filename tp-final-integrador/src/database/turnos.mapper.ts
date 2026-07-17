/**
 * Mapper para el módulo de Turnos.
 * Convierte registros de la base de datos (snake_case) a objetos de transferencia de datos (DTO) en camelCase.
 */

/**
 * Mapea una fila de la base de datos a un DTO de Turno.
 * @param {Object} row - Fila de la base de datos.
 * @param {Object} [options] - Opciones de mapeo.
 * @param {boolean} [options.omitDoctor=false] - Omite los datos del médico en el DTO.
 * @param {boolean} [options.omitPatient=false] - Omite los datos del paciente en el DTO.
 * @returns {Object} DTO en camelCase.
 */
export const toDTO = (row, options = {}) => {
  if (!row) return null;

  const { omitDoctor = false, omitPatient = false } = options;

  return {
    id: row.id_turno_reserva,
    fechaHora: row.fecha_hora,
    valorTotal: row.valor_total ? Number(row.valor_total) : 0,
    atendido: Boolean(row.atendido),
    activo: row.activo,
    medico:
      !omitDoctor && (row.medico_apellido || row.id_medico)
        ? {
            id: row.id_medico,
            apellido: row.medico_apellido,
            nombres: row.medico_nombres,
            especialidad: row.especialidad,
          }
        : undefined,
    paciente:
      !omitPatient && (row.paciente_apellido || row.id_paciente)
        ? {
            id: row.id_paciente,
            apellido: row.paciente_apellido,
            nombres: row.paciente_nombres,
            email: row.paciente_email,
          }
        : undefined,
    obraSocial:
      row.obra_social_nombre || row.id_obra_social
        ? {
            id: row.id_obra_social,
            nombre: row.obra_social_nombre,
          }
        : undefined,
  };
};

/**
 * Mapea una lista de filas de la base de datos a una lista de DTOs.
 * @param {Array} rows - Lista de filas.
 * @param {Object} [options] - Opciones de mapeo.
 * @returns {Array} Lista de DTOs.
 */
export const toDTOList = (rows, options = {}) => {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((row) => toDTO(row, options));
};

export const toDoctorStatistics = (rows = []) => {
  return rows.map((row) => ({
    idMedico: row.id_medico,
    medico: row.medico,
    cantidadTurnos: Number(row.cantidad_turnos),
  }));
};

export const toDateStatistics = (rows = []) => {
  return rows.map((row) => ({
    fecha: row.fecha,
    cantidadTurnos: Number(row.cantidad_turnos),
  }));
};

export const toSpecialtyStatistics = (rows = []) => {
  return rows.map((row) => ({
    idEspecialidad: row.id_especialidad,
    especialidad: row.especialidad,
    cantidadTurnos: Number(row.cantidad_turnos),
  }));
};

export const toPatientYearStatistics = (rows = []) => {
  return rows.map((row) => ({
    idTurno: row.id_turno_reserva,
    idPaciente: row.id_paciente,
    paciente: row.paciente,
    fechaHora: row.fecha_hora,
    idMedico: row.id_medico,
    medico: row.medico,
    especialidad: row.especialidad,
    atendido: Boolean(row.atendido),
  }));
};
