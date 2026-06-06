import { pool } from '../config/db.js';
import * as pacientesMapper from './pacientes.mapper.js';

/**
 * Busca todos los pacientes.
 * @returns {Promise<Object|null>}
 */
export const findAll = async () => {
  const query = `SELECT p.id_paciente, p.id_usuario, 
 p.id_obra_social, u.apellido, u.nombres, u.activo
 FROM pacientes p
 JOIN usuarios u ON p.id_usuario = u.id_usuario`;
  const [rows] = await pool.execute(query);

  if (rows.length === 0) return null;

  return pacientesMapper.toDTOFullList(rows);
};

/**
 * Busca un paciente por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const query = `
    SELECT p.id_paciente, p.id_usuario, p.id_obra_social, u.activo
    FROM pacientes p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    WHERE p.id_paciente = ?
  `;
  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) return null;
  return pacientesMapper.toDTO(rows[0]);
};

/**
 * Busca un paciente por su ID de usuario.
 * @param {number} idUsuario
 * @returns {Promise<Object|null>}
 */
export const findByUserId = async (idUsuario) => {
  const query = `
    SELECT p.id_paciente, p.id_usuario, p.id_obra_social, u.activo
    FROM pacientes p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    WHERE p.id_usuario = ?
  `;
  const [rows] = await pool.execute(query, [idUsuario]);

  if (rows.length === 0) return null;
  return pacientesMapper.toDTO(rows[0]);
};
