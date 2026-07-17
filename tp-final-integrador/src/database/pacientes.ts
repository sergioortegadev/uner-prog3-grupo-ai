import { pool } from '../config/db.ts';
import * as pacientesMapper from './pacientes.mapper.ts';

/**
 * Busca todos los pacientes.
 * @returns {Promise<Object|null>}
 */
export const findAll = async () => {
  const query = `SELECT * FROM v_pacientes`;
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
  const query = `SELECT * FROM v_pacientes WHERE id_paciente = ?`;
  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) return null;
  return pacientesMapper.toDTOFull(rows[0]);
};

/**
 * Busca un paciente por su ID de usuario.
 * @param {number} idUsuario
 * @returns {Promise<Object|null>}
 */
export const findByUserId = async (idUsuario) => {
  const query = `SELECT * FROM v_pacientes WHERE id_usuario = ?`;
  const [rows] = await pool.execute(query, [idUsuario]);

  if (rows.length === 0) return null;
  return pacientesMapper.toDTOFull(rows[0]);
};

/**
 * Asocia una obra social a un paciente.
 * @param {number} idPaciente
 * @param {number} idObraSocial
 * @returns {Promise<boolean>}
 */
export const assignObraSocial = async (idPaciente, idObraSocial) => {
  const query = `
    UPDATE pacientes 
    SET id_obra_social = ? 
    WHERE id_paciente = ?
  `;
  const [result] = await pool.execute(query, [idObraSocial, idPaciente]);
  return result.affectedRows > 0;
};
