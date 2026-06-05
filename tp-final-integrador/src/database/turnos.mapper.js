/**
 * Mapper para la entidad Turno.
 */

export const toDTO = (row, options = {}) => {
  if (!row) return null;

  const { omitirMedico = false, omitirPaciente = false } = options;

  return {
    id: row.id_turno_reserva,
    fechaHora: row.fecha_hora,
    valorTotal: row.valor_total ? Number(row.valor_total) : 0,
    atendido: Boolean(row.atendido),
    activo: row.activo,
    medico:
      !omitirMedico && (row.medico_apellido || row.id_medico)
        ? {
            id: row.id_medico,
            apellido: row.medico_apellido,
            nombres: row.medico_nombres,
            especialidad: row.especialidad,
          }
        : undefined,
    paciente:
      !omitirPaciente && (row.paciente_apellido || row.id_paciente)
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

export const toDTOs = (rows, options = {}) => rows.map((row) => toDTO(row, options));
