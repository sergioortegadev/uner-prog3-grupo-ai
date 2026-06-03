import { pool } from '../config/db.js';
import { DB_STATUS } from '../constants/common.constants.js';

/**
 * Busca un usuario por su email.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, documento, apellido, nombres, email, contrasenia, rol FROM usuarios WHERE email = ? AND activo = ?',
    [email, DB_STATUS.ACTIVE],
  );

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Busca un usuario por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, documento, apellido, nombres, email, rol FROM usuarios WHERE id_usuario = ? AND activo = ?',
    [id, DB_STATUS.ACTIVE],
  );

  if (rows.length === 0) return null;
  return rows[0];
};
