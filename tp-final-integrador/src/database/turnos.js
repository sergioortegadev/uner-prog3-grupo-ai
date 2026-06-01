import { pool } from '../config/db.js';

/**
 * Registra un nuevo turno.
 * @param {Object} data
 * @returns {Promise<number>} ID del turno creado.
 */
export const create = async (data) => {
  const { idMedico, idPaciente, idObraSocial, fechaHora, valorTotal } = data;

  const query = `
    INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo)
    VALUES (?, ?, ?, ?, ?, 0, 1)
  `;

  const [result] = await pool.execute(query, [
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
  ]);

  return result.insertId;
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
    WHERE id_paciente = ? AND fecha_hora = ? AND activo = 1
  `;
  const [rows] = await pool.execute(query, [idPaciente, fechaHora]);
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
    WHERE id_medico = ? AND fecha_hora = ? AND activo = 1
  `;
  const [rows] = await pool.execute(query, [idMedico, fechaHora]);
  return rows.length > 0;
};
