import { pool } from '../config/db.js';
import { DB_STATUS } from '../constants/common.constants.js';
import * as usuariosMapper from './usuarios.mapper.js';

/**
 * Busca un usuario por email y contraseña (la comparación SHA2-256 se realiza a nivel de base de datos).
 * @param {string} email
 * @param {string} password - Contraseña en texto plano; hasheada a nivel de base de datos.
 * @returns {Promise<Object|null>} `{ id, rol, nombreCompleto }` o null si las credenciales son inválidas.
 */
export const findByCredentials = async (email, password) => {
  const [rows] = await pool.execute(
    "SELECT id_usuario, rol, CONCAT(apellido, ', ', nombres) AS nombre_completo FROM usuarios WHERE email = ? AND contrasenia = SHA2(?, 256) AND activo = ?",
    [email, password, DB_STATUS.ACTIVE],
  );

  if (rows.length === 0) return null;
  return usuariosMapper.toDTO(rows[0]);
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
  return usuariosMapper.toDTO(rows[0]);
};
