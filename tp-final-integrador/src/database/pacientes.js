import { pool } from '../config/db.js';
import * as pacientesMapper from './pacientes.mapper.js';

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
