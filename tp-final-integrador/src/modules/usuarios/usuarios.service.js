import bcryptjs from 'bcryptjs';
import { pool } from '../../config/db.js';
import * as usuariosModel from './usuarios.model.js';
import { ROLES } from '../../constants/roles.constants.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Lógica de negocio para el módulo de usuarios.
 */

/**
 * Hashea una contraseña.
 * @param {string} password Contraseña en texto plano.
 * @returns {Promise<string>} Contraseña hasheada.
 */
const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

/**
 * Registra un nuevo usuario con su respectivos perfil.
 * @param {Object} userData Datos del registro.
 * @returns {Promise<Object>} Usuario creado.
 */
export const registrarUsuario = async (userData) => {
  const { email, documento, password, rol } = userData;

  // 1. Buscar incluyendo inactivos
  const usuarioPorEmail = await usuariosModel.findByEmail(email, { includeInactive: true });
  const usuarioPorDocumento = await usuariosModel.findByDocumento(documento, {
    includeInactive: true,
  });

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Si existe y está activo → DUPLICATE_ENTRY
    if (usuarioPorEmail && usuarioPorEmail.activo === 1) {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El email ya está registrado');
    }
    if (usuarioPorDocumento && usuarioPorDocumento.activo === 1) {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El documento ya está registrado');
    }

    // documento de baja, pero con email distinto o nuevo
    if (
      usuarioPorDocumento &&
      usuarioPorDocumento.activo === 0 &&
      (!usuarioPorEmail || usuarioPorEmail.id_usuario !== usuarioPorDocumento.id_usuario)
    ) {
      throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, 'El documento ya está registrado');
    }

    const hashedPassword = await hashPassword(password);
    let id_usuario;
    const isReactivation = usuarioPorEmail && usuarioPorEmail.activo === 0;

    if (isReactivation) {
      // === REACTIVACIÓN ===
      const oldRol = usuarioPorEmail.rol;
      const newRol = Number(rol);

      // Si cambió el rol: eliminar perfil viejo y crear nuevo
      if (oldRol !== newRol) {
        if (oldRol === ROLES.MEDICO) {
          await usuariosModel.deleteMedicoProfile(connection, usuarioPorEmail.id_usuario);
        } else if (oldRol === ROLES.PACIENTE) {
          await usuariosModel.deletePacienteProfile(connection, usuarioPorEmail.id_usuario);
        }
      }

      // Actualizar usuario
      await usuariosModel.reactivateUser(connection, usuarioPorEmail.id_usuario, {
        ...userData,
        contrasenia: hashedPassword,
      });
      id_usuario = usuarioPorEmail.id_usuario;
    } else {
      // === REGISTRO NUEVO ===
      // Crear usuario
      id_usuario = await usuariosModel.create(connection, {
        ...userData,
        contrasenia: hashedPassword,
      });
    }

    // 2. Crear/actualizar perfil según rol
    const rolNum = Number(rol);
    if (rolNum === ROLES.MEDICO) {
      // Validar que la especialidad exista
      const especialidad = await usuariosModel.findEspecialidadById(userData.id_especialidad);
      if (!especialidad) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'La especialidad especificada no existe');
      }

      // Si es reactivación y mantuvo el rol, actualizar; sino crear
      if (isReactivation && usuarioPorEmail.rol === ROLES.MEDICO) {
        await usuariosModel.updateMedicoProfile(connection, id_usuario, {
          id_especialidad: userData.id_especialidad,
          matricula: userData.matricula,
          valor_consulta: userData.valor_consulta,
        });
      } else {
        await usuariosModel.createMedico(connection, {
          id_usuario,
          id_especialidad: userData.id_especialidad,
          matricula: userData.matricula,
          valor_consulta: userData.valor_consulta,
        });
      }
    } else if (rolNum === ROLES.PACIENTE) {
      // Validar que la obra social exista
      const obraSocial = await usuariosModel.findObraSocialById(userData.id_obra_social);
      if (!obraSocial) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'La obra social especificada no existe');
      }

      // Si es reactivación y mantuvo el rol, actualizar; sino crear
      if (isReactivation && usuarioPorEmail.rol === ROLES.PACIENTE) {
        await usuariosModel.updatePacienteProfile(connection, id_usuario, {
          id_obra_social: userData.id_obra_social,
        });
      } else {
        await usuariosModel.createPaciente(connection, {
          id_usuario,
          id_obra_social: userData.id_obra_social,
        });
      }
    }

    await connection.commit();

    return {
      id_usuario,
      email,
      documento,
      rol,
      foto_path: userData.foto_path,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
