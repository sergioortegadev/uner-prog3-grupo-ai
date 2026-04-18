import { pool } from '../../config/db.js';

/**
 * Obtiene el listado de médicos, opcionalmente filtrado por especialidad.
 * Utiliza la vista v_medicos que ya trae la especialidad, el id_especialidad y si están activos.
 */
export const findAll = async (id_especialidad = null) => {
  let sql = 'SELECT * FROM v_medicos';
  const params = [];

  if (id_especialidad) {
    sql = 'SELECT * FROM v_medicos WHERE id_especialidad = ?';
    params.push(id_especialidad);
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
};
/**
 * Busca un médico por su ID.
 */
export const findById = async (id_medico) => {
  const [rows] = await pool.execute(
    'SELECT id_medico, id_usuario, id_especialidad, matricula, valor_consulta FROM medicos WHERE id_medico = ?',
    [id_medico],
  );
  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Actualiza la especialidad de un médico.
 */
export const updateEspecialidad = async (id_medico, id_especialidad) => {
  await pool.execute('UPDATE medicos SET id_especialidad = ? WHERE id_medico = ?', [
    id_especialidad,
    id_medico,
  ]);
};

/**
 * Verifica si un médico tiene asociada una obra social.
 */
export const findObraSocialAsociada = async (id_medico, id_obra_social) => {
  const [rows] = await pool.execute(
    'SELECT id_medico_obra_social, activo FROM medicos_obras_sociales WHERE id_medico = ? AND id_obra_social = ?',
    [id_medico, id_obra_social],
  );
  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Asocia una obra social a un médico (nueva o reactivando soft-delete).
 */
export const addObraSocial = async (id_medico, id_obra_social, id_medico_obra_social = null) => {
  if (id_medico_obra_social) {
    await pool.execute(
      'UPDATE medicos_obras_sociales SET activo = 1 WHERE id_medico_obra_social = ?',
      [id_medico_obra_social],
    );
    return;
  }
  await pool.execute(
    'INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, 1)',
    [id_medico, id_obra_social],
  );
};

/**
 * Desvincula (soft-delete) una obra social de un médico.
 */
export const removeObraSocial = async (id_medico, id_obra_social) => {
  const query =
    'UPDATE medicos_obras_sociales SET activo = 0 WHERE id_medico = ? AND id_obra_social = ? AND activo = 1';
  const [result] = await pool.execute(query, [id_medico, id_obra_social]);
  return result.affectedRows;
};
