import { pool } from '../config/db.js';
import { DB_STATUS } from '../constants/common.constants.js';
import * as turnosMapper from './turnos.mapper.js';

/**
 * Registra un nuevo turno.
 * @param {Object} data
 * @returns {Promise<number>} ID del turno creado.
 */
export const create = async (data) => {
  const { idMedico, idPaciente, idObraSocial, fechaHora, valorTotal } = data;

  const query = `
    INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `;

  const [result] = await pool.execute(query, [
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
    DB_STATUS.ACTIVE,
  ]);

  return result.insertId;
};

/**
 * Obtiene los turnos de un médico.
 * @param {number} idMedico
 * @returns {Promise<Object[]>}
 */
export const findByMedicoId = async (idMedico) => {
  const query = `
    SELECT 
      tr.*, 
      u.apellido AS paciente_apellido, 
      u.nombres AS paciente_nombres, 
      u.email AS paciente_email, 
      os.nombre AS obra_social_nombre
    FROM turnos_reservas tr
    JOIN pacientes p ON tr.id_paciente = p.id_paciente
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN obras_sociales os ON tr.id_obra_social = os.id_obra_social
    WHERE tr.id_medico = ? AND tr.activo = ?
    ORDER BY tr.fecha_hora DESC
  `;
  const [rows] = await pool.execute(query, [idMedico, DB_STATUS.ACTIVE]);
  return turnosMapper.toDTOs(rows, { omitirMedico: true });
};

/**
 * Obtiene los turnos de un paciente.
 * @param {number} idPaciente
 * @returns {Promise<Object[]>}
 */
export const findByPacienteId = async (idPaciente) => {
  const query = `
    SELECT 
      tr.*, 
      u.apellido AS medico_apellido, 
      u.nombres AS medico_nombres, 
      e.nombre AS especialidad, 
      os.nombre AS obra_social_nombre
    FROM turnos_reservas tr
    JOIN medicos m ON tr.id_medico = m.id_medico
    JOIN usuarios u ON m.id_usuario = u.id_usuario
    JOIN especialidades e ON m.id_especialidad = e.id_especialidad
    JOIN obras_sociales os ON tr.id_obra_social = os.id_obra_social
    WHERE tr.id_paciente = ? AND tr.activo = ?
    ORDER BY tr.fecha_hora DESC
  `;
  const [rows] = await pool.execute(query, [idPaciente, DB_STATUS.ACTIVE]);
  return turnosMapper.toDTOs(rows, { omitirPaciente: true });
};

/**
 * Verifica si un paciente ya tiene un turno reservado en una fecha y hora específicas de forma activa.
 * @param {number} idPaciente
 * @param {string} fechaHora
 * @returns {Promise<boolean>}
 */
export const checkPatientOverlap = async (idPaciente, fechaHora) => {
  const query = `
    SELECT 1 FROM turnos_reservas
    WHERE id_paciente = ? AND fecha_hora = ? AND activo = ?
  `;
  const [rows] = await pool.execute(query, [idPaciente, fechaHora, DB_STATUS.ACTIVE]);
  return rows.length > 0;
};

/**
 * Verifica si un médico ya tiene un turno reservado en una fecha y hora específicas de forma activa.
 * @param {number} idMedico
 * @param {string} fechaHora
 * @returns {Promise<boolean>}
 */
export const existsByMedicoAndFechaHora = async (idMedico, fechaHora) => {
  const query = `
    SELECT 1 FROM turnos_reservas
    WHERE id_medico = ? AND fecha_hora = ? AND activo = ?
  `;
  const [rows] = await pool.execute(query, [idMedico, fechaHora, DB_STATUS.ACTIVE]);
  return rows.length > 0;
};
