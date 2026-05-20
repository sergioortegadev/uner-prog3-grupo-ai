import { pool } from '../config/db.js';
import { AppError } from '../helpers/errors.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';
import { QUERY_PARAMS, DB_STATUS } from '../constants/common.constants.js';
import * as especialidadesMapper from './especialidades.mapper.js';

const ORDER_MAP = {
  id: 'id_especialidad',
  nombre: 'nombre',
  activo: 'activo',
};

/**
 * Retorna todas las especialidades activas o no, con paginación, orden y filtros.
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

  const dbOrder = ORDER_MAP[order] || 'id_especialidad';

  const whereClauses = [];
  if (activo === DB_STATUS.ACTIVE) {
    whereClauses.push('activo = 1');
  } else if (activo === DB_STATUS.INACTIVE) {
    whereClauses.push('activo = 0');
  }

  const queryValues = [];

  if (nombre) {
    whereClauses.push('LOWER(nombre) LIKE LOWER(?)');
    queryValues.push(`%${nombre}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const direction = asc ? QUERY_PARAMS.ASC.toUpperCase() : QUERY_PARAMS.DESC.toUpperCase();

  // Obtener total para metadatos
  const countQuery = `SELECT COUNT(*) as total FROM especialidades ${whereSql}`;
  const [countRows] = await pool.execute(countQuery, queryValues);
  const total = countRows[0].total;

  // Obtener registros paginados
  const query = `
    SELECT id_especialidad, nombre, activo
    FROM especialidades
    ${whereSql}
    ORDER BY ${dbOrder} ${direction}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(query, [...queryValues, String(limit), String(offset)]);

  return {
    data: especialidadesMapper.toDTOList(rows),
    total,
  };
};

/**
 * Busca una especialidad por nombre exacto (case-insensitive).
 * @param {string} nombre - Nombre de la especialidad.
 * @returns {Promise<Object|null>} Especialidad encontrada o null.
 */
export const findByName = async (nombre) => {
  const query =
    'SELECT id_especialidad, nombre, activo FROM especialidades WHERE LOWER(nombre) = LOWER(?)';
  const [rows] = await pool.execute(query, [nombre]);
  if (rows.length === 0) return null;
  return especialidadesMapper.toDTO(rows[0]);
};

/**
 * Busca una especialidad por ID.
 * @param {number} id - ID de la especialidad.
 * @param {boolean} onlyActive - Si es true, solo busca especialidades activas.
 */
export const findById = async (id, onlyActive = true) => {
  let query =
    'SELECT id_especialidad, nombre, activo FROM especialidades WHERE id_especialidad = ?';

  if (onlyActive) {
    query += ' AND activo = 1';
  }

  const [rows] = await pool.execute(query, [id]);
  if (rows.length === 0) return null;
  return especialidadesMapper.toDTO(rows[0]);
};

/**
 * Crea una nueva especialidad.
 */
export const create = async (data) => {
  const { nombre } = data;

  const query = 'INSERT INTO especialidades (nombre, activo) VALUES (?, 1)';
  try {
    const [result] = await pool.execute(query, [nombre]);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una especialidad con ese nombre');
    }
    throw error;
  }
};

/**
 * Actualiza los datos de una especialidad.
 */
export const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(data.nombre);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (fields.length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No hay campos válidos para actualizar');
  }

  const query = `UPDATE especialidades SET ${fields.join(', ')} WHERE id_especialidad = ?`;
  values.push(id);

  try {
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) return false;

    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una especialidad con ese nombre');
    }
    throw error;
  }
};

/**
 * Realiza un borrado lógico.
 */
export const softDelete = async (id) => {
  const query = 'UPDATE especialidades SET activo = 0 WHERE id_especialidad = ? AND activo = 1';
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};
