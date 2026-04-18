import { pool } from '../../config/db.js';

/**
 * Obtiene un paciente por su ID.
 */
export const findById = async (id_paciente) => {
  const [rows] = await pool.execute(
    'SELECT id_paciente, id_usuario, id_obra_social FROM pacientes WHERE id_paciente = ?',
    [id_paciente],
  );
  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Actualiza la obra social de un paciente.
 */
export const updateObraSocial = async (id_paciente, id_obra_social) => {
  await pool.execute('UPDATE pacientes SET id_obra_social = ? WHERE id_paciente = ?', [
    id_obra_social,
    id_paciente,
  ]);
};
