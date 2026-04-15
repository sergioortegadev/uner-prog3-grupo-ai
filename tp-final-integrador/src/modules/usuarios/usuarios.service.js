import bcryptjs from 'bcryptjs';
import { pool } from '../../config/db.js';
import * as usuariosModel from './usuarios.model.js';
import { ROLES } from '../../constants/roles.constants.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Lógica de negocio para el módulo de usuarios.
 */

/**
 * Registra un nuevo usuario con su respectivos perfil.
 * @param {Object} userData Datos del registro.
 * @returns {Promise<Object>} Usuario creado.
 */
export const registrarUsuario = async (userData) => {
  const { email, documento, password, rol } = userData;

  // 1. Verificar si ya existe el email o documento
  const existeEmail = await usuariosModel.findByEmail(email);
  if (existeEmail) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El email ya está registrado');
  }

  const existeDocumento = await usuariosModel.findByDocumento(documento);
  if (existeDocumento) {
    throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El documento ya está registrado');
  }

  // 2. Hashear contraseña
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  // 3. Obtener conexión para la transacción
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 4. Crear usuario base
    const id_usuario = await usuariosModel.create(connection, {
      ...userData,
      contrasenia: hashedPassword,
    });

    // 5. Crear perfil según rol
    const rolNum = Number(rol);
    if (rolNum === ROLES.MEDICO) {
      // Validar que la especialidad exista
      const existeEspecialidad = await usuariosModel.findEspecialidadById(userData.id_especialidad);
      if (!existeEspecialidad) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, 'La especialidad especificada no existe');
      }

      await usuariosModel.createMedico(connection, {
        id_usuario,
        id_especialidad: userData.id_especialidad,
        matricula: userData.matricula,
        valor_consulta: userData.valor_consulta,
      });
    } else if (rolNum === ROLES.PACIENTE) {
      // Validar que la obra social exista
      const existeObraSocial = await usuariosModel.findObraSocialById(userData.id_obra_social);
      if (!existeObraSocial) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, 'La obra social especificada no existe');
      }

      await usuariosModel.createPaciente(connection, {
        id_usuario,
        id_obra_social: userData.id_obra_social,
      });
    }

    // 6. Confirmar transacción
    await connection.commit();

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userResult } = userData;
    return { id_usuario, ...userResult };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
