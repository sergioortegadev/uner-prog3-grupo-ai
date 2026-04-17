import { pool } from '../../config/db.js';
import { AppError } from '../../helpers/errors.helper.js';
import { ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Mapper helper para convertir snake_case de la DB a camelCase para JS.
 */
const mapToCamelCase = (row) => ({
  id: row.id_especialidad,
  nombre: row.nombre,
  activo: row.activo,
});

/**
 * Retorna todas las especialidades activas.
 */
export const findAllActive = async () => {
  const query = 'SELECT id_especialidad, nombre, activo FROM especialidades WHERE activo = 1';
  const [rows] = await pool.execute(query);
  return rows.map(mapToCamelCase);
};

/**
 * Busca una especialidad activa por ID.
 */
export const findById = async (id) => {
  const query =
    'SELECT id_especialidad, nombre, activo FROM especialidades WHERE id_especialidad = ? AND activo = 1';
  const [rows] = await pool.execute(query, [id]);
  if (rows.length === 0) return null;
  return mapToCamelCase(rows[0]);
};

/**
 * Crea una nueva especialidad o reactiva una existente.
 */
export const create = async (data) => {
  const { nombre } = data;

  const [existing] = await pool.execute(
    'SELECT id_especialidad, activo FROM especialidades WHERE LOWER(nombre) = LOWER(?)',
    [nombre],
  );

  if (existing.length > 0) {
    const especialidad = existing[0];
    if (especialidad.activo === 0) {
      await pool.execute(
        'UPDATE especialidades SET activo = 1, nombre = ? WHERE id_especialidad = ?',
        [nombre, especialidad.id_especialidad],
      );
      return especialidad.id_especialidad;
    } else {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una especialidad con ese nombre');
    }
  }

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

  if (fields.length === 0) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, 'No hay campos para actualizar');
  }

  const query = `UPDATE especialidades SET ${fields.join(', ')} WHERE id_especialidad = ? AND activo = 1`;
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
