import { pool } from '../../config/db.js';
import { AppError } from '../../helpers/errors.helper.js';
import { ERROR_CODES } from '../../helpers/response.helper.js';

/**
 * Mapper helper para convertir snake_case de la DB a camelCase para JS.
 * Asegura que los tipos de datos sean correctos (booleans, numbers).
 */
const mapToCamelCase = (row) => ({
  id: row.id_obra_social,
  nombre: row.nombre,
  descripcion: row.descripcion,
  porcentajeDescuento: row.porcentaje_descuento !== null ? Number(row.porcentaje_descuento) : 0,
  esParticular: !!row.es_particular,
  activo: row.activo,
});

/**
 * Retorna todas las obras sociales activas.
 */
export const findAllActive = async () => {
  const query =
    'SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo FROM obras_sociales WHERE activo = 1';
  const [rows] = await pool.execute(query);
  return rows.map(mapToCamelCase);
};

/**
 * Busca una obra social activa por ID.
 */
export const findById = async (id) => {
  const query =
    'SELECT id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo FROM obras_sociales WHERE id_obra_social = ? AND activo = 1';
  const [rows] = await pool.execute(query, [id]);
  if (rows.length === 0) return null;
  return mapToCamelCase(rows[0]);
};

/**
 * Crea una nueva obra social o reactiva una existente.
 */
export const create = async (data) => {
  const { nombre, descripcion, porcentajeDescuento, esParticular } = data;

  const [existing] = await pool.execute(
    'SELECT id_obra_social, activo FROM obras_sociales WHERE LOWER(nombre) = LOWER(?)',
    [nombre],
  );

  if (existing.length > 0) {
    const obraSocial = existing[0];
    if (obraSocial.activo === 0) {
      await pool.execute(
        'UPDATE obras_sociales SET activo = 1, nombre = ?, descripcion = ?, porcentaje_descuento = ?, es_particular = ? WHERE id_obra_social = ?',
        [nombre, descripcion, porcentajeDescuento, esParticular ? 1 : 0, obraSocial.id_obra_social],
      );
      return obraSocial.id_obra_social;
    } else {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'Ya existe una obra social con ese nombre');
    }
  }

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

  if (fields.length === 0) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, 'No hay campos para actualizar');
  }

  const query = `UPDATE obras_sociales SET ${fields.join(', ')} WHERE id_obra_social = ? AND activo = 1`;
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
