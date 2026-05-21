import { pool } from '../config/db.js';

/**
 * Busca un médico por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const query = `
    SELECT m.id_medico, m.id_usuario, m.id_especialidad, m.matricula, m.descripcion, m.valor_consulta,
           u.apellido, u.nombres, u.email
    FROM medicos m
    INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
    WHERE m.id_medico = ? AND u.activo = 1
  `;
  const [rows] = await pool.execute(query, [id]);

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Asocia múltiples obras sociales a un médico en una transacción.
 * Maneja la idempotencia ignorando duplicados.
 * @param {number} idMedico
 * @param {number[]} idsObrasSociales
 * @returns {Promise<boolean>}
 */
export const assignObrasSociales = async (idMedico, idsObrasSociales) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const query = `
      INSERT IGNORE INTO medicos_obras_sociales (id_medico, id_obra_social, activo)
      VALUES (?, ?, 1)
    `;

    for (const idObraSocial of idsObrasSociales) {
      await connection.execute(query, [idMedico, idObraSocial]);
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

/**
 * Obtiene las obras sociales asociadas a un médico.
 * @param {number} idMedico
 * @returns {Promise<number[]>} IDs de obras sociales
 */
export const getObrasSocialesIds = async (idMedico) => {
  const query =
    'SELECT id_obra_social FROM medicos_obras_sociales WHERE id_medico = ? AND activo = 1';
  const [rows] = await pool.execute(query, [idMedico]);
  return rows.map((row) => row.id_obra_social);
};
