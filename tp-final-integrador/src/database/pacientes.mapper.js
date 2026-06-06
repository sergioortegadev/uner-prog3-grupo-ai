/**
 * Mapper para el módulo de Pacientes.
 * Convierte registros de la base de datos (snake_case) a objetos de transferencia de datos (DTO) en camelCase.
 */

/**
 * Mapea una fila de la tabla Pacientes unida con datos de la tabla de Usuarios a un DTO de Paciente Completo.
 * @param {Object} row - Fila de la base de datos.
 * @returns {Object} DTO en camelCase.
 */
export const toDTOFull = (row) => {
  if (!row) return null;

  return {
    idPaciente: row.id_paciente,
    idUsuario: row.id_usuario,
    idObraSocial: row.id_obra_social,
    apellido: row.apellido,
    nombre: row.nombres,
    activo: !!row.activo,
  };
};

/**
 * Mapea una fila de la base de datos a un DTO de Paciente.
 * @param {Object} row - Fila de la base de datos.
 * @returns {Object} DTO en camelCase.
 */
export const toDTO = (row) => {
  if (!row) return null;

  return {
    idPaciente: row.id_paciente,
    idUsuario: row.id_usuario,
    idObraSocial: row.id_obra_social,
    activo: !!row.activo,
  };
};

/**
 * Mapea una lista de filas de la base de datos a una lista de DTOs.
 * @param {Array} rows - Lista de filas.
 * @returns {Array} Lista de DTOs.
 */
export const toDTOList = (rows) => {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(toDTO);
};

/**
 * Mapea una lista de filas de la base de datos a una lista de DTOs.
 * @param {Array} rows - Lista de filas.
 * @returns {Array} Lista de DTOs.
 */
export const toDTOFullList = (rows) => {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map(toDTOFull);
};
