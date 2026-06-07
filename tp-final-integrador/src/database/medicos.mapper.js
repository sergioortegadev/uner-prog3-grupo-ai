/**
 * Mapper para el módulo de Médicos.
 * Convierte registros de la base de datos (snake_case) a objetos de transferencia de datos (DTO) en camelCase.
 */

/**
 * Mapea una fila de la base de datos a un DTO de Médico.
 * @param {Object} row - Fila de la base de datos.
 * @returns {Object} DTO en camelCase.
 */
export const toDTO = (row) => {
  if (!row) return null;

  return {
    idMedico: row.id_medico,
    idUsuario: row.id_usuario,
    nombres: row.nombres,
    apellido: row.apellido,
    idEspecialidad: row.id_especialidad,
    matricula: row.matricula,
    valorConsulta: row.valor_consulta !== null ? Number(row.valor_consulta) : 0,
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
