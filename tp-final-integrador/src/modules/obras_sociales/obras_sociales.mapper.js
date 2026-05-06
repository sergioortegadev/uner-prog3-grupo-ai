/**
 * Mapper para el módulo de Obras Sociales.
 * Convierte registros de la base de datos (snake_case) a objetos de transferencia de datos (DTO) en camelCase.
 */

/**
 * Mapea una fila de la base de datos a un DTO de Obra Social.
 * @param {Object} row - Fila de la base de datos.
 * @returns {Object} DTO en camelCase.
 */
export const toDTO = (row) => {
  if (!row) return null;

  return {
    id: row.id_obra_social,
    nombre: row.nombre,
    descripcion: row.descripcion,
    porcentajeDescuento: row.porcentaje_descuento !== null ? Number(row.porcentaje_descuento) : 0,
    esParticular: !!row.es_particular,
    activo: row.activo,
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
