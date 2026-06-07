import { pool } from "../config/db.js";
import { QUERY_PARAMS, DB_STATUS } from '../constants/common.constants.js'; // Ajusta la ruta
import * as especialidadesMapper from './especialidades.mapper.js'

const ORDER_MAP = {
  id: 'id_especialidad',
  nombre: 'nombre',
};

/**
 * findAll: Soporta paginación, filtros y ordenamiento.
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
  const direction = asc ? 'ASC' : 'DESC';

  const whereClauses = [];
  const queryValues = [];

  
  if (activo !== DB_STATUS.ALL) {
    whereClauses.push(`activo = ?`);
    queryValues.push(activo);
  }

  if (nombre) {
    whereClauses.push('LOWER(nombre) LIKE LOWER(?)');
    queryValues.push(`%${nombre}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';


  const countQuery = `SELECT COUNT(*) as total FROM especialidades ${whereSql}`;
  const [countRows] = await pool.execute(countQuery, queryValues);
  const total = countRows[0].total;
  
  // datos paginados
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

export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id_especialidad, nombre, activo FROM especialidades WHERE id_especialidad = ?', 
    [id]
  );
  return especialidadesMapper.toDTO(rows[0])
};

export const findByName = async (nombre) => {
  const [rows] = await pool.execute(
    'SELECT id_especialidad, nombre, activo FROM especialidades WHERE LOWER(nombre) = LOWER(?)', 
    [nombre]
  );
  return especialidadesMapper.toDTO(rows[0])
};

export const create = async (data) => {
  const [result] = await pool.execute(
    'INSERT INTO especialidades (nombre, activo) VALUES (?, ?)', 
    [data.nombre, DB_STATUS.ACTIVE]
  );
  return result.insertId;
};

export const update = async (id, data) => {
  const [result] = await pool.execute(
    'UPDATE especialidades SET nombre = ? WHERE id_especialidad = ?', 
    [data.nombre, id]
  );
  return result.affectedRows > 0;
};

export const softDelete = async (id) => {
  const [result] = await pool.execute(
    'UPDATE especialidades SET activo = ? WHERE id_especialidad = ?', 
    [DB_STATUS.INACTIVE, id]
  );
  return result.affectedRows > 0;
};