/**
 * Mapper para el módulo de Usuarios.
 * Convierte registros de la base de datos (snake_case) a objetos de transferencia de datos (DTO) en camelCase.
 */

/**
 * Mapea una fila de la base de datos a un DTO de Usuario.
 * @param {Object} row - Fila de la base de datos.
 * @returns {Object} DTO en camelCase.
 */
export const toDTO = (row) => {
  if (!row) return null;

  const dto = {};

  if (row.id_usuario !== undefined) dto.id = row.id_usuario;
  if (row.documento !== undefined) dto.documento = row.documento;
  if (row.apellido !== undefined) dto.apellido = row.apellido;
  if (row.nombres !== undefined) dto.nombres = row.nombres;
  if (row.email !== undefined) dto.email = row.email;
  if (row.rol !== undefined) dto.rol = row.rol;
  if (row.nombre_completo !== undefined) dto.nombreCompleto = row.nombre_completo;
  if (row.foto_path !== undefined) dto.fotoUrl = row.foto_path;

  return dto;
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
