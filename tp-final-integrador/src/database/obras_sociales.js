import { pool } from '../config/db.js';
import { QUERY_PARAMS, DB_STATUS } from '../constants/common.constants.js';
import * as obrasSocialesMapper from './obras_sociales.mapper.js';

const ORDER_MAP = {
  id: 'id_obra_social',
  nombre: 'nombre',
  porcentajeDescuento: 'porcentaje_descuento',
  activo: 'activo',
};

/**
 * Retorna todas las obras sociales activas o no, con paginación, orden y filtros.
 * @param {Object} params - Parámetros de búsqueda (limit, offset, order, asc, nombre, active)
 */
export const findAll = async (params = {}) => {
  const {
    limit = QUERY_PARAMS.DEFAULT_LIMIT,
    offset = QUERY_PARAMS.DEFAULT_OFFSET,
    order = 'id',
    asc = true,
    nombre,
    activo = DB_STATUS.ACTIVE,
  } = params;

  const dbOrder = ORDER_MAP[order] || 'id_obra_social';

  const whereClauses = [];
  if (activo === DB_STATUS.ACTIVE) {
    whereClauses.push(`activo = ${DB_STATUS.ACTIVE}`);
  } else if (activo === DB_STATUS.INACTIVE) {
    whereClauses.push(`activo = ${DB_STATUS.INACTIVE}`);
  }

  const queryValues = [];

  if (nombre) {
    whereClauses.push('LOWER(nombre) LIKE LOWER(?)');
    queryValues.push(`%${nombre}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const direction = asc ? QUERY_PARAMS.ASC.toUpperCase() : QUERY_PARAMS.DESC.toUpperCase();

  // Obtener total para metadatos
  const countQuery = `SELECT COUNT(*) as total FROM obras_sociales ${whereSql}`;
  const [countRows] = await pool.execute(countQuery, queryValues);
  const total = countRows[0].total;

  // Obtener registros paginados
  const query = `
    SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo
    FROM obras_sociales
    ${whereSql}
    ORDER BY ${dbOrder} ${direction}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(query, [...queryValues, String(limit), String(offset)]);

  return {
    data: obrasSocialesMapper.toDTOList(rows),
    total,
  };
};

/**
 * Busca una obra social por nombre exacto (case-insensitive).
 * @param {string} nombre - Nombre de la obra social.
 * @returns {Promise<Object|null>} Obra social encontrada o null.
 */
export const findByName = async (nombre) => {
  const query =
    'SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo FROM obras_sociales WHERE LOWER(nombre) = LOWER(?)';
  const [rows] = await pool.execute(query, [nombre]);
  if (rows.length === 0) return null;
  return obrasSocialesMapper.toDTO(rows[0]);
};

/**
 * Busca una obra social por ID.
 * @param {number} id - ID de la obra social.
 * @param {boolean} onlyActive - Si es true, solo busca obras sociales activas.
 */
export const findById = async (id, onlyActive = true) => {
  let query =
    'SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo FROM obras_sociales WHERE id_obra_social = ?';

  if (onlyActive) {
    query += ` AND activo = ${DB_STATUS.ACTIVE}`;
  }

  const [rows] = await pool.execute(query, [id]);
  if (rows.length === 0) return null;
  return obrasSocialesMapper.toDTO(rows[0]);
};

/**
 * Busca múltiples obras sociales por sus IDs y verifica que estén activas.
 * @param {number[]} ids
 * @returns {Promise<Object[]>} Lista de obras sociales encontradas.
 */
export const findByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];

  const placeholders = ids.map(() => '?').join(', ');
  const query = `
    SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo
    FROM obras_sociales
    WHERE id_obra_social IN (${placeholders}) AND activo = 1
  `;

  const [rows] = await pool.query(query, ids);
  return obrasSocialesMapper.toDTOList(rows);
};

/**
 * Crea una nueva obra social.
 */
export const create = async (data) => {
  const { nombre, descripcion, porcentajeDescuento, esParticular } = data;

  const query =
    'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)';
  const [result] = await pool.execute(query, [
    nombre,
    descripcion ?? '',
    porcentajeDescuento ?? 0,
    esParticular ?? false,
    DB_STATUS.ACTIVE,
  ]);
  return result.insertId;
};

/**
 * Actualiza los datos de una obra social.
 */
export const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.descripcion !== undefined) {
    fields.push('descripcion = ?');
    values.push(data.descripcion);
  }
  if (data.porcentajeDescuento !== undefined) {
    fields.push('porcentaje_descuento = ?');
    values.push(data.porcentajeDescuento);
  }
  if (data.esParticular !== undefined) {
    fields.push('es_particular = ?');
    values.push(data.esParticular);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? DB_STATUS.ACTIVE : DB_STATUS.INACTIVE);
  }

  if (fields.length === 0) {
    throw new Error('No hay campos válidos para actualizar');
  }

  const query = `UPDATE obras_sociales SET ${fields.join(', ')} WHERE id_obra_social = ?`;
  values.push(id);

  const [result] = await pool.execute(query, values);

  if (result.affectedRows === 0) return false;

  return true;
};

/**
 * Realiza un borrado lógico.
 */
export const softDelete = async (id) => {
  const query = 'UPDATE obras_sociales SET activo = ? WHERE id_obra_social = ? AND activo = ?';
  const [result] = await pool.execute(query, [DB_STATUS.INACTIVE, id, DB_STATUS.ACTIVE]);
  return result.affectedRows > 0;
};
