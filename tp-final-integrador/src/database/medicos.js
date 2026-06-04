import { pool } from '../config/db.js';
import * as medicosMapper from './medicos.mapper.js';
import { DB_STATUS } from '../constants/common.constants.js';

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

/**
 * Obtiene los IDs de las obras sociales activas asociadas a un médico.
 * @param {number} idMedico
 * @returns {Promise<number[]>}
 */
export const getObrasSocialesIds = async (idMedico) => {
  const query = `
    SELECT id_obra_social FROM medicos_obras_sociales
    WHERE id_medico = ? AND activo = ?
  `;
  const [rows] = await pool.execute(query, [idMedico, DB_STATUS.ACTIVE]);
  return rows.map((row) => row.id_obra_social);
};

/**
 * Asocia una lista de obras sociales a un médico.
 * Si ya existe una relación inactiva, la reactiva. Si no existe, la crea.
 * @param {number} idMedico
 * @param {number[]} idsObrasSociales
 * @returns {Promise<boolean>}
 */
export const assignObrasSociales = async (idMedico, idsObrasSociales) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const idObraSocial of idsObrasSociales) {
      const checkQuery = `
        SELECT id_medico_obra_social, activo FROM medicos_obras_sociales
        WHERE id_medico = ? AND id_obra_social = ?
      `;
      const [rows] = await connection.execute(checkQuery, [idMedico, idObraSocial]);

      if (rows.length > 0) {
        if (rows[0].activo !== DB_STATUS.ACTIVE) {
          const updateQuery = `
            UPDATE medicos_obras_sociales
            SET activo = ?
            WHERE id_medico_obra_social = ?
          `;
          await connection.execute(updateQuery, [DB_STATUS.ACTIVE, rows[0].id_medico_obra_social]);
        }
      } else {
        const insertQuery = `
          INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo)
          VALUES (?, ?, ?)
        `;
        await connection.execute(insertQuery, [idMedico, idObraSocial, DB_STATUS.ACTIVE]);
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
