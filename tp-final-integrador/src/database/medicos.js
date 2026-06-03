import { pool } from '../config/db.js';
import { DB_STATUS } from '../constants/common.constants.js';
import * as medicosMapper from './medicos.mapper.js';

/**
 * Busca un médico por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const query = `
    SELECT m.id_medico, m.id_usuario, m.id_especialidad, m.matricula, m.valor_consulta, u.activo
    FROM medicos m
    JOIN usuarios u ON m.id_usuario = u.id_usuario
    WHERE m.id_medico = ?
  `;
  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) return null;
  return medicosMapper.toDTO(rows[0]);
};

/**
 * Verifica si un médico atiende una obra social específica de forma activa.
 * @param {number} idMedico
 * @param {number} idObraSocial
 * @returns {Promise<boolean>}
 */
export const acceptsObraSocial = async (idMedico, idObraSocial) => {
  const query = `
    SELECT 1 FROM medicos_obras_sociales
    WHERE id_medico = ? AND id_obra_social = ? AND activo = ?
  `;
  const [rows] = await pool.execute(query, [idMedico, idObraSocial, DB_STATUS.ACTIVE]);
  return rows.length > 0;
};
