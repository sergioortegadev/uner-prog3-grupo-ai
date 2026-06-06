import { pool } from '../config/db.js';
import { ATTENDED_STATUS, DB_STATUS } from '../constants/common.constants.js';
import * as turnosMapper from './turnos.mapper.js';

/**
 * Registra un nuevo turno
 * @param {Object} data
 * @returns {Promise<number|null>} ID del turno creado o null si hubo conflicto de horario.
 */
export const create = async (data) => {
  const { idMedico, idPaciente, idObraSocial, fechaHora, valorTotal } = data;

  const query = `
    INSERT INTO turnos_reservas (id_medico, id_paciente, id_obra_social, fecha_hora, valor_total, atendido, activo)
    SELECT ?, ?, ?, ?, ?, ?, ?
    FROM (SELECT 1) AS tmp
    WHERE NOT EXISTS (
      SELECT 1 FROM turnos_reservas
      WHERE id_medico = ? AND fecha_hora = ? AND activo = ?
    ) AND NOT EXISTS (
      SELECT 1 FROM turnos_reservas
      WHERE id_paciente = ? AND fecha_hora = ? AND activo = ?
    )
  `;

  const [result] = await pool.execute(query, [
    idMedico,
    idPaciente,
    idObraSocial,
    fechaHora,
    valorTotal,
    ATTENDED_STATUS.PENDING,
    DB_STATUS.ACTIVE,
    idMedico,
    fechaHora,
    DB_STATUS.ACTIVE,
    idPaciente,
    fechaHora,
    DB_STATUS.ACTIVE,
  ]);

  return result.affectedRows > 0 ? result.insertId : null;
};

/**
 * Obtiene los turnos de un médico con paginación, orden y filtros.
 * @param {number} idMedico
 * @param {Object} [params] - Parámetros de búsqueda.
 */
export const findByDoctorId = async (idMedico, params = {}) => {
  const { limit = null, offset = null, order = 'fecha_hora', asc = false, atendido } = params;

  const whereClauses = ['tr.id_medico = ?', 'tr.activo = ?'];
  const queryParams = [idMedico, DB_STATUS.ACTIVE];

  if (atendido !== undefined) {
    whereClauses.push('tr.atendido = ?');
    queryParams.push(atendido);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM turnos_reservas tr
    ${whereSql}
  `;
  const [countRows] = await pool.execute(countQuery, queryParams);
  const total = countRows[0].total;

  const direction = asc ? 'ASC' : 'DESC';
  let query = `
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
    ${whereSql}
    ORDER BY tr.${order} ${direction}
  `;
  if (limit !== null) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(String(limit), String(offset ?? 0));
  }

  const [rows] = await pool.execute(query, queryParams);
  return { data: turnosMapper.toDTOList(rows, { omitDoctor: true }), total };
};

/**
 * Obtiene los turnos de un paciente con paginación, orden y filtros.
 * @param {number} idPaciente
 * @param {Object} [params] - Parámetros de búsqueda.
 */
export const findByPatientId = async (idPaciente, params = {}) => {
  const { limit = null, offset = null, order = 'fecha_hora', asc = false, atendido } = params;

  const whereClauses = ['tr.id_paciente = ?', 'tr.activo = ?'];
  const queryParams = [idPaciente, DB_STATUS.ACTIVE];

  if (atendido !== undefined) {
    whereClauses.push('tr.atendido = ?');
    queryParams.push(atendido);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM turnos_reservas tr
    ${whereSql}
  `;
  const [countRows] = await pool.execute(countQuery, queryParams);
  const total = countRows[0].total;

  const direction = asc ? 'ASC' : 'DESC';
  let query = `
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
    ${whereSql}
    ORDER BY tr.${order} ${direction}
  `;
  if (limit !== null) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(String(limit), String(offset ?? 0));
  }

  const [rows] = await pool.execute(query, queryParams);
  return { data: turnosMapper.toDTOList(rows, { omitPatient: true }), total };
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
export const existsByDoctorAndDateTime = async (idMedico, fechaHora) => {
  const query = `
    SELECT 1 FROM turnos_reservas
    WHERE id_medico = ? AND fecha_hora = ? AND activo = ?
  `;
  const [rows] = await pool.execute(query, [idMedico, fechaHora, DB_STATUS.ACTIVE]);
  return rows.length > 0;
};

/**
 * Busca un turno por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const query = `
    SELECT
      tr.*,
      u_med.apellido AS medico_apellido,
      u_med.nombres AS medico_nombres,
      e.nombre AS especialidad,
      u_pac.apellido AS paciente_apellido,
      u_pac.nombres AS paciente_nombres,
      u_pac.email AS paciente_email,
      os.nombre AS obra_social_nombre
    FROM turnos_reservas tr
    LEFT JOIN medicos m ON tr.id_medico = m.id_medico
    LEFT JOIN usuarios u_med ON m.id_usuario = u_med.id_usuario
    LEFT JOIN especialidades e ON m.id_especialidad = e.id_especialidad
    LEFT JOIN pacientes p ON tr.id_paciente = p.id_paciente
    LEFT JOIN usuarios u_pac ON p.id_usuario = u_pac.id_usuario
    LEFT JOIN obras_sociales os ON tr.id_obra_social = os.id_obra_social
    WHERE tr.id_turno_reserva = ?
  `;
  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) return null;
  return turnosMapper.toDTO(rows[0]);
};

/**
 * Actualiza el estado de atención de un turno.
 * @param {number} id
 * @param {number} atendido - 1 para atendido, 0 para no atendido.
 * @returns {Promise<void>}
 */
export const updateAttended = async (id, atendido) => {
  const query = `
    UPDATE turnos_reservas
    SET atendido = ?
    WHERE id_turno_reserva = ?
  `;
  await pool.execute(query, [atendido, id]);
};
