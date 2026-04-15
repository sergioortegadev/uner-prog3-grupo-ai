import { pool } from '../../config/db.js';

/**
 * Busca un usuario por su email.
 * @param {string} email
 * @param {Object} options - Opciones de búsqueda
 * @param {boolean} options.includeInactive - Si true, incluye usuarios inactivos
 * @returns {Promise<Object|null>}
 */
export const findByEmail = async (email, { includeInactive = false } = {}) => {
  const sql = includeInactive
    ? 'SELECT id_usuario, documento, apellido, nombres, email, contrasenia, rol, activo FROM usuarios WHERE email = ?'
    : 'SELECT id_usuario, documento, apellido, nombres, email, contrasenia, rol FROM usuarios WHERE email = ? AND activo = 1';
  const [rows] = await pool.execute(sql, [email]);

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Busca un usuario por documento.
 * @param {string} documento
 * @param {Object} options - Opciones de búsqueda
 * @param {boolean} options.includeInactive - Si true, incluye usuarios inactivos
 * @returns {Promise<Object|null>}
 */
export const findByDocumento = async (documento, { includeInactive = false } = {}) => {
  const sql = includeInactive
    ? 'SELECT id_usuario, activo FROM usuarios WHERE documento = ?'
    : 'SELECT id_usuario FROM usuarios WHERE documento = ? AND activo = 1';
  const [rows] = await pool.execute(sql, [documento]);

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Busca un usuario por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, documento, apellido, nombres, email, rol FROM usuarios WHERE id_usuario = ? AND activo = 1',
    [id],
  );

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Crea un nuevo usuario.
 * @param {Object} connection Conexión de la base de datos (para transacciones).
 * @param {Object} userData Datos del usuario.
 * @returns {Promise<number>} ID del usuario creado.
 */
export const create = async (connection, userData) => {
  const { documento, apellido, nombres, email, contrasenia, rol } = userData;
  const [result] = await connection.execute(
    'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [documento, apellido, nombres, email, contrasenia, '', rol, 1],
  );
  return result.insertId;
};

/**
 * Crea un perfil de médico.
 * @param {Object} connection Conexión de la base de datos.
 * @param {Object} medicoData Datos del médico.
 */
export const createMedico = async (connection, medicoData) => {
  const { id_usuario, id_especialidad, matricula, valor_consulta } = medicoData;
  await connection.execute(
    'INSERT INTO medicos (id_usuario, id_especialidad, matricula, descripcion, valor_consulta) VALUES (?, ?, ?, ?, ?)',
    [id_usuario, id_especialidad, matricula, '', valor_consulta],
  );
};

/**
 * Crea un perfil de paciente.
 * @param {Object} connection Conexión de la base de datos.
 * @param {Object} pacienteData Datos del paciente.
 */
export const createPaciente = async (connection, pacienteData) => {
  const { id_usuario, id_obra_social } = pacienteData;
  await connection.execute('INSERT INTO pacientes (id_usuario, id_obra_social) VALUES (?, ?)', [
    id_usuario,
    id_obra_social,
  ]);
};

/**
 * Verifica si existe una especialidad por su ID.
 * @param {number} id_especialidad ID de la especialidad.
 * @returns {Promise<Object|null>} La especialidad si existe, null si no.
 */
export const findEspecialidadById = async (id_especialidad) => {
  const [rows] = await pool.execute(
    'SELECT id_especialidad, nombre FROM especialidades WHERE id_especialidad = ? AND activo = 1',
    [id_especialidad],
  );

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Verifica si existe una obra social por su ID.
 * @param {number} id_obra_social ID de la obra social.
 * @returns {Promise<Object|null>} La obra social si existe, null si no.
 */
export const findObraSocialById = async (id_obra_social) => {
  const [rows] = await pool.execute(
    'SELECT id_obra_social, nombre FROM obras_sociales WHERE id_obra_social = ? AND activo = 1',
    [id_obra_social],
  );

  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Reactiva un usuario actualizando sus datos.
 * @param {Object} connection - Conexión de transacción
 * @param {number} id_usuario - ID del usuario a reactivar
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise<number>} ID del usuario reactivado
 */
export const reactivateUser = async (connection, id_usuario, userData) => {
  const { documento, apellido, nombres, email, contrasenia, rol } = userData;
  await connection.execute(
    'UPDATE usuarios SET documento = ?, apellido = ?, nombres = ?, email = ?, contrasenia = ?, rol = ?, activo = 1 WHERE id_usuario = ?',
    [documento, apellido, nombres, email, contrasenia, rol, id_usuario],
  );
  return id_usuario;
};

/**
 * Busca perfil de médico por id_usuario.
 * @param {number} id_usuario
 * @returns {Promise<Object|null>}
 */
export const findMedicoByUserId = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT id_medico, id_especialidad, matricula FROM medicos WHERE id_usuario = ?',
    [id_usuario],
  );
  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Busca perfil de paciente por id_usuario.
 * @param {number} id_usuario
 * @returns {Promise<Object|null>}
 */
export const findPacienteByUserId = async (id_usuario) => {
  const [rows] = await pool.execute(
    'SELECT id_paciente, id_obra_social FROM pacientes WHERE id_usuario = ?',
    [id_usuario],
  );
  if (rows.length === 0) return null;
  return rows[0];
};

/**
 * Actualiza el perfil de médico.
 * @param {Object} connection
 * @param {number} id_usuario
 * @param {Object} medicoData Datos a actualizar
 */
export const updateMedicoProfile = async (connection, id_usuario, medicoData) => {
  const { id_especialidad, matricula, valor_consulta } = medicoData;
  await connection.execute(
    'UPDATE medicos SET id_especialidad = ?, matricula = ?, valor_consulta = ? WHERE id_usuario = ?',
    [id_especialidad, matricula, valor_consulta, id_usuario],
  );
};

/**
 * Actualiza el perfil de paciente.
 * @param {Object} connection
 * @param {number} id_usuario
 * @param {Object} pacienteData Datos a actualizar
 */
export const updatePacienteProfile = async (connection, id_usuario, pacienteData) => {
  const { id_obra_social } = pacienteData;
  await connection.execute('UPDATE pacientes SET id_obra_social = ? WHERE id_usuario = ?', [
    id_obra_social,
    id_usuario,
  ]);
};

/**
 * Elimina el perfil de médico.
 * @param {Object} connection
 * @param {number} id_usuario
 */
export const deleteMedicoProfile = async (connection, id_usuario) => {
  await connection.execute('DELETE FROM medicos WHERE id_usuario = ?', [id_usuario]);
};

/**
 * Elimina el perfil de paciente.
 * @param {Object} connection
 * @param {number} id_usuario
 */
export const deletePacienteProfile = async (connection, id_usuario) => {
  await connection.execute('DELETE FROM pacientes WHERE id_usuario = ?', [id_usuario]);
};
