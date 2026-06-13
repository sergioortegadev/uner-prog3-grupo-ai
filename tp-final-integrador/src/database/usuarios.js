import { pool } from '../config/db.js';
import { DB_STATUS } from '../constants/common.constants.js';
import * as usuariosMapper from './usuarios.mapper.js';

/**
 * Busca solo los usuarios ACTIVOS.
 * @returns {Promise<Object|null>}
 */
export const findAll = async () => {
  const [rows] = await pool.execute(
    "SELECT id_usuario, rol, CONCAT(apellido, ' ,', nombres) AS nombre_completo, documento, email, foto_path, rol FROM usuarios WHERE activo = ?",
    [DB_STATUS.ACTIVE],
  );

  if (rows.length === 0) return null;
  return usuariosMapper.toDTOFullList(rows);
};
/**
 * Busca un usuario por email y contraseña (la comparación SHA2-256 se realiza a nivel de base de datos).
 * @param {string} email
 * @param {string} password - Contraseña en texto plano; hasheada a nivel de base de datos.
 * @returns {Promise<Object|null>} `{ id, rol, nombreCompleto }` o null si las credenciales son inválidas.
 */
export const findByCredentials = async (email, password) => {
  const [rows] = await pool.execute(
    "SELECT id_usuario, rol, CONCAT(apellido, ', ', nombres) AS nombre_completo FROM usuarios WHERE email = ? AND contrasenia = SHA2(?, 256) AND activo = ?",
    [email, password, DB_STATUS.ACTIVE],
  );

  if (rows.length === 0) return null;
  return usuariosMapper.toDTO(rows[0]);
};

/**
 * Busca un usuario por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, rol, documento, apellido, nombres, email, foto_path FROM usuarios WHERE id_usuario = ? AND activo = ?',
    [id, 1],
  );

  if (rows.length === 0) return null;
  return usuariosMapper.toDTOFull(rows[0]);
};

/**
 * Busca un usuario por su ID, incluye soft deleted.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findByIdAll = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, rol, documento, apellido, nombres, email, foto_path FROM usuarios WHERE id_usuario = ?',
    [id],
  );

  if (rows.length === 0) return null;
  return usuariosMapper.toDTOFull(rows[0]);
};

/**
 * Modifica un usuario.
 * @param {number} id
 * @param {object} newData
 * @returns {Promise<Object|null>}
 */
export const updateUser = async (id, newData) => {
  const fields = [];
  const values = [];

  if (newData.documento !== undefined) {
    fields.push('documento = ?');
    values.push(newData.documento);
  }
  if (newData.apellido !== undefined) {
    fields.push('apellido = ?');
    values.push(newData.apellido);
  }
  if (newData.nombres !== undefined) {
    fields.push('nombres = ?');
    values.push(newData.nombres);
  }
  if (newData.email !== undefined) {
    fields.push('email = ?');
    values.push(newData.email);
  }
  if (newData.contrasenia !== undefined) {
    fields.push('contrasenia = SHA2(?, 256)');
    values.push(newData.contrasenia);
  }
  if (newData.foto_path !== undefined) {
    fields.push('foto_path = ?');
    values.push(newData.foto_path);
  }
  if (newData.rol !== undefined) {
    fields.push('rol = ?');
    values.push(newData.rol);
  }

  if (fields.length === 0) {
    return await findById(id);
  }

  const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ? AND activo = ?`;
  values.push(id, DB_STATUS.ACTIVE);

  await pool.execute(query, values);

  return await findById(id);
};

/**
 * Crea un usuario ADMIN.
 * @param {object} newData
 * @returns {Promise<Object|null>}
 */
export const createAdminUser = async (newData) => {
  const { documento, apellido, nombres, email, contrasenia, foto_path } = newData;

  const query = `
    INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo)
    VALUES (?, ?, ?, ?, SHA2(?, 256), ?, 3, 1)
  `;
  const values = [documento, apellido, nombres, email, contrasenia, foto_path ?? ''];

  const [result] = await pool.execute(query, values);

  if (result.affectedRows === 0) return null;

  // Retornar el usuario creado
  return await findById(result.insertId, DB_STATUS.ACTIVE);
};
/**
 * Crea un usuario Paciente.
 * @param {object} newData
 * @returns {Promise<Object|null>}
 */
export const createPatienceUser = async (newData) => {
  const { documento, apellido, nombres, email, contrasenia, foto_path } = newData;

  const connection = await pool.getConnection();

  try {
    const query = `
    INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo)
    VALUES (?, ?, ?, ?, SHA2(?, 256), ?, 2, ?)
  `;
    const values = [
      documento,
      apellido,
      nombres,
      email,
      contrasenia,
      foto_path ?? '',
      DB_STATUS.ACTIVE,
    ];

    await connection.beginTransaction();

    const [result] = await connection.execute(query, values);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    const userId = result.insertId;

    const insertPacienteQuery = `INSERT INTO pacientes (id_usuario, id_obra_social) VALUES (?, ?)`;
    const insertPacienteValues = [userId, 5];

    const [pacienteResult] = await connection.execute(insertPacienteQuery, insertPacienteValues);
    if (pacienteResult.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    await connection.commit();

    // Retornar el usuario creado
    return await findById(userId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
/**
 * Crea un usuario Doctor.
 * @param {object} newData
 * @returns {Promise<Object|null>}
 */
export const createDoctorUser = async (newData) => {
  const {
    documento,
    apellido,
    nombres,
    email,
    contrasenia,
    foto_path,
    id_especialidad,
    matricula,
    descripcion,
    valor_consulta,
  } = newData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const createUserQuery = `
      INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo)
      VALUES (?, ?, ?, ?, SHA2(?, 256), ?, 1, ?)
    `;
    const userValues = [
      documento,
      apellido,
      nombres,
      email,
      contrasenia,
      foto_path ?? '',
      DB_STATUS.ACTIVE,
    ];

    const [result] = await connection.execute(createUserQuery, userValues);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    const userId = result.insertId;
    const createMedicoQuery = `
      INSERT INTO medicos (id_usuario, id_especialidad, matricula, descripcion, valor_consulta)
      VALUES (?, ?, ?, ?, ?)
    `;
    const medicoValues = [userId, id_especialidad, matricula, descripcion ?? null, valor_consulta];

    const [medicoResult] = await connection.execute(createMedicoQuery, medicoValues);
    if (medicoResult.affectedRows === 0) {
      await connection.rollback();
      return null;
    }

    await connection.commit();

    return await findById(userId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Soft delete usuario.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const deleteUser = async (id) => {
  const query = `UPDATE usuarios SET activo = ? WHERE id_usuario = ?`;
  return await pool.execute(query, [0, id]);
};

/**
 * Reactivar usuario eliminado con soft delete.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const reactivateUser = async (id) => {
  const query = `UPDATE usuarios SET activo = ? WHERE id_usuario = ?`;
  const confirm = await pool.execute(query, [1, id]);
  if (confirm) return findById(id);
  return confirm;
};
