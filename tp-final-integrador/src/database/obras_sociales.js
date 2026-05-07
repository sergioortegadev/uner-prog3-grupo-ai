import { pool } from '../config/db.js';
import { AppError } from '../helpers/errors.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';
import * as obrasSocialesMapper from './obras_sociales.mapper.js';

/**
 * Retorna todas las obras sociales activas o no, con paginación, orden y filtros.
 * @param {Object} params - Parámetros de búsqueda (limit, offset, order, asc, nombre, active)
 */
export const findAll = async (params = {}) => {
  const {
    limit = 10,
    offset = 0,
    order = 'id_obra_social',
    asc = true,
    nombre,
    activo = 1,
  } = params;

  const whereClauses =
    activo === 'all' ? [] : activo === 1 ? ['activo = 1'] : activo === 0 ? ['activo = 0'] : [];
  const queryValues = [];

  if (nombre) {
    whereClauses.push('LOWER(nombre) LIKE LOWER(?)');
    queryValues.push(`%${nombre}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const direction = asc ? 'ASC' : 'DESC';

  // Obtener total para metadatos
  const countQuery = `SELECT COUNT(*) as total FROM obras_sociales ${whereSql}`;
  const [countRows] = await pool.execute(countQuery, queryValues);
  const total = countRows[0].total;

  // Obtener registros paginados
  const query = `
    SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo
    FROM obras_sociales
    ${whereSql}
    ORDER BY ${order} ${direction}
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
    query += ' AND activo = 1';
  }

  const [rows] = await pool.execute(query, [id]);
  if (rows.length === 0) return null;
  return obrasSocialesMapper.toDTO(rows[0]);
};

/**
 * Crea una nueva obra social.
 * Nota: La validación de nombre duplicado la hace el Service (lógica de negocio).
 * El modelo solo intenta el INSERT y maneja el error de BD como respaldo.
 */
export const create = async (data) => {
  const { nombre, descripcion, porcentajeDescuento, esParticular } = data;

  const query =
    'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, 1)';
  try {
    const [result] = await pool.execute(query, [
      nombre,
      descripcion ?? '',
      porcentajeDescuento ?? 0,
      esParticular ? 1 : 0,
    ]);
    return result.insertId;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una obra social con ese nombre');
    }
    throw error;
  }
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
    values.push(data.esParticular ? 1 : 0);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    values.push(data.activo ? 1 : 0);
  }

  if (fields.length === 0) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, 'No hay campos para actualizar');
  }

  const query = `UPDATE obras_sociales SET ${fields.join(', ')} WHERE id_obra_social = ?`;
  values.push(id);

  try {
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) return false;

    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una obra social con ese nombre');
    }
    throw error;
  }
};

/**
 * Realiza un borrado lógico.
 */
export const softDelete = async (id) => {
  const query = 'UPDATE obras_sociales SET activo = 0 WHERE id_obra_social = ? AND activo = 1';
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};
