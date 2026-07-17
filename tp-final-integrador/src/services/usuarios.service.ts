import * as usuariosModel from '../database/usuarios.ts';
import * as obrasSocialesModel from '../database/obras_sociales.ts';
import * as especialidadesModel from '../database/especialidades.ts';
import { findActiveOrThrow } from '../helpers/entity.helper.ts';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.ts';
import { getUploadsDir } from '../middlewares/multer.middleware.ts';
import { deleteUploadedFile } from '../helpers/url.helper.ts';

/**
 * Asocia un médico con una lista de obras sociales.
 * @param {number} idMedico
 * @param {number[]} idsObrasSociales
 */
export const assignObrasSociales = async (idMedico, idsObrasSociales) => {
  const medico = await usuariosModel.findById(idMedico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, `Médico con ID ${idMedico} no encontrado`);
  }

  const uniqueIds = [...new Set(idsObrasSociales)];
  const encontradas = await obrasSocialesModel.findByIds(uniqueIds);

  if (encontradas.length !== uniqueIds.length) {
    const encontradasIds = encontradas.map((os) => os.id);
    const faltantes = uniqueIds.filter((id) => !encontradasIds.includes(id));
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Las siguientes Obras Sociales no existen o están inactivas: ${faltantes.join(', ')}`,
    );
  }

  const actuales = await usuariosModel.getObrasSocialesIds(idMedico);
  const nuevas = uniqueIds.filter((id) => !actuales.includes(id));
  const yaExistentes = uniqueIds.filter((id) => actuales.includes(id));

  if (nuevas.length === 0) {
    return {
      message: 'El médico ya tiene todas las obras sociales indicadas asociadas',
      asociadas: [],
      yaExistentes,
    };
  }

  await usuariosModel.assignObrasSociales(idMedico, nuevas);

  return {
    message: 'Obras sociales asociadas correctamente',
    asociadas: nuevas,
    yaExistentes,
  };
};

/**
 * Obtiene el listado de todos los usuarios activos.
 * @returns {Promise<Object|null>}
 */
export const findAll = async () => {
  return await usuariosModel.findAll();
};

/**
 * Busca usuario ACTIVO por id_usuario.
 * @param {number} idUsuario
 * @param {number} active - Optional. Default = 1 activo, 0 eliminado
 * @returns {Promise<Object|null>}
 */
export const getById = async (idUsuario) => {
  return await usuariosModel.findById(idUsuario);
};

/**
 * Busca usuarios por id_usuario, Activos y Soft Deleted.
 * @param {number} idUsuario
 * @param {number} active - Optional. Default = 1 activo, 0 eliminado
 * @returns {Promise<Object|null>}
 */
export const getByIdAll = async (idUsuario) => {
  return await usuariosModel.findByIdAll(idUsuario);
};

/**
 * Modifica usuario.
 * @param {number} idUsuario - ID del usuario a actualizar
 * @param {Object} datosNuevos - Datos a actualizar
 * @param {Object} requester - Datos del usuario que realiza la solicitud { id, rol }
 */
export const updateUser = async (idUsuario, datosNuevos) => {
  const targetUser = await usuariosModel.findById(idUsuario);

  if (!targetUser) {
    throw new AppError(ERROR_CODES.NOT_FOUND, `Usuario con ID ${idUsuario} no encontrado`);
  }

  const updatedUser = await usuariosModel.updateUser(idUsuario, datosNuevos);

  // Si la actualización fue exitosa y se subió una nueva foto, eliminamos la anterior del disco
  if (datosNuevos.foto_path && targetUser.fotoPath) {
    const oldFileName = targetUser.fotoPath;

    // Evitamos intentar borrar si no hay un archivo previo real o si es el mismo
    if (oldFileName && oldFileName !== datosNuevos.foto_path) {
      await deleteUploadedFile(oldFileName, getUploadsDir()).catch((error) => {
        // Logueamos el error pero no fallamos la petición ya que el usuario ya se actualizó en DB
        console.error('Error al eliminar la foto de perfil antigua:', error);
      });
    }
  }

  return updatedUser;
};

/**
 * Crea usuario ADMIN.
 * @param {number} idUsuario
 */
export const createAdminUser = async (datosNuevos) => {
  const newUserAdminCreated = await usuariosModel.createAdminUser(datosNuevos);

  return newUserAdminCreated;
};

/**
 * Crea usuario Paciente.
 * @param {Object} datosNuevos
 */
export const createPacienteUser = async (datosNuevos) => {
  const newUserPacienteCreated = await usuariosModel.createPacienteUser(datosNuevos);

  return newUserPacienteCreated;
};

/**
 * Crea usuario Doctor.
 * @param {number} idUsuario
 */
export const createDoctorUser = async (datosNuevos) => {
  await findActiveOrThrow(
    (id) => especialidadesModel.findById(id, false),
    datosNuevos.id_especialidad,
    {
      notFoundMessage: `Especialidad con ID ${datosNuevos.id_especialidad} no encontrada`,
      inactiveMessage: `La especialidad con ID ${datosNuevos.id_especialidad} está inactiva`,
    },
  );

  const newUserDoctorCreated = await usuariosModel.createDoctorUser(datosNuevos);

  return newUserDoctorCreated;
};

/**
 * Soft delete usuario.
 * @param {number} idUsuario
 */
export const deleteUser = async (id) => {
  return await usuariosModel.deleteUser(id);
};

/**
 * Reactivar usuario eliminado con soft delete.
 * @param {number} idUsuario
 */
export const reactivateUser = async (id) => {
  return await usuariosModel.reactivateUser(id);
};

export const obtenerPorEspecialidad = async (idEspecialidad) => {
  await findActiveOrThrow((id) => especialidadesModel.findById(id, false), idEspecialidad, {
    notFoundMessage: `Especialidad con ID ${idEspecialidad} no encontrada`,
    inactiveMessage: `La especialidad con ID ${idEspecialidad} está inactiva`,
  });

  return await usuariosModel.findByEspecialidad(idEspecialidad);
};

/**  Actualiza la especialidad de un médico.
 * @param {number} idMedico
 * @param {number} idEspecialidad
 * @returns {Promise<Object>}
 */
export const updateEspecialidad = async (idMedico, idEspecialidad) => {
  const medico = await findActiveOrThrow(usuariosModel.findById, idMedico, {
    notFoundMessage: `Médico con ID ${idMedico} no encontrado`,
    inactiveMessage: `El médico con ID ${idMedico} está inactivo`,
  });

  await findActiveOrThrow((id) => especialidadesModel.findById(id, false), idEspecialidad, {
    notFoundMessage: `Especialidad con ID ${idEspecialidad} no encontrada`,
    inactiveMessage: `La especialidad con ID ${idEspecialidad} está inactiva`,
  });

  if (medico.idEspecialidad !== idEspecialidad) {
    await usuariosModel.updateEspecialidad(idMedico, idEspecialidad);
  }

  return {
    idMedico,
    idEspecialidad,
  };
};
