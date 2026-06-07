import { pool } from '../config/db.js';
import * as pacientesMapper from './pacientes.mapper.js';

/**
 * Busca todos los pacientes.
 * @returns {Promise<Object|null>}
 */
export const findAll = async () => {
  const query = `
  SELECT p.id_paciente, p.id_usuario, 
  p.id_obra_social, u.apellido, u.nombres, 
  u.documento, u.activo
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
    SELECT p.id_paciente, p.id_usuario, 
    p.id_obra_social, u.apellido, u.nombres, 
    u.documento, u.activo 
    FROM pacientes p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    WHERE p.id_paciente = ?
    `;
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

/**
 * Asocia un paciente a una obra social, por ID de paciente y Id de obra social.
 * @param {number} idPaciente
 * @param {number} idObraSocial
 * @returns {Promise<Object|null>}
 */
export const assignObrasSociales = async (idPaciente, idObraSocial) => {
  const query = `
  UPDATE pacientes
  SET id_obra_social = ?
  WHERE id_paciente = ?
  `;
  const [rows] = await pool.execute(query, [idObraSocial, idPaciente]);

  if (rows.affectedRows === 1) {
    const pacienteActualizado = await findById(idPaciente);
    return pacienteActualizado;
  }
  return null;
};
