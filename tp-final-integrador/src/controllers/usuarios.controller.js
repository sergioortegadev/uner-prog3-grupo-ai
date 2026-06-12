import { matchedData } from 'express-validator';
import * as usuariosService from '../services/usuarios.service.js';
import { errorResponse, successResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Controlador para el módulo de Usuarios
 */

// export const assignObrasSociales = async (req, res) => {
//   const { idMedico, obrasSociales } = matchedData(req);

//   const result = await medicosService.assignObrasSociales(idMedico, obrasSociales);
//   const status = result.asociadas.length > 0 ? 201 : 200;

//   return successResponse(res, result, status);
// };

/**
 * Obtiene el listado de todos los usuarios.
 */
export const obtenerTodos = async (req, res) => {
  const result = await usuariosService.obtenerTodos();

  return successResponse(res, result, 200);
};

/**
 * Busca usuario ACTIVO por id_usuario
 */
export const getById = async (req, res) => {
  const { id_usuario } = matchedData(req);

  const result = await usuariosService.getById(id_usuario);
  if (!result) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  return successResponse(res, result);
};

/**
 * Modifica Usuario
 */
export const updateUser = async (req, res) => {
  const { id_usuario } = matchedData(req, { locations: ['params'] });
  const userDatosNuevos = matchedData(req, { locations: ['body'] });
  const usuarioActualizado = await usuariosService.updateUser(id_usuario, userDatosNuevos);

  if (!usuarioActualizado) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, usuarioActualizado, 201);
};
/**
 * Crea Usuario Admin
 */
export const createAdminUser = async (req, res) => {
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  const nuevoUsuarioAdminCreado = await usuariosService.createAdminUser(userDatosNuevos);

  if (!nuevoUsuarioAdminCreado) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, nuevoUsuarioAdminCreado, 201);
};
/**
 * Crea Usuario Paciente
 */
export const createPatienceUser = async (req, res) => {
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  const nuevoUsuarioPacienteCreado = await usuariosService.createPatienceUser(userDatosNuevos);

  if (!nuevoUsuarioPacienteCreado) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, nuevoUsuarioPacienteCreado, 201);
};
/**
 * Crea Usuario Médico
 */
export const createDoctorUser = async (req, res) => {
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  const nuevoUsuarioMedicoCreado = await usuariosService.createDoctorUser(userDatosNuevos);

  if (!nuevoUsuarioMedicoCreado) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, nuevoUsuarioMedicoCreado, 201);
};

/**
 * Soft delete user.
 */
export const deleteUser = async (req, res) => {
  const { id_usuario } = matchedData(req, { locations: ['params'] });

  const usuarioAEliminar = await usuariosService.getById(id_usuario);
  if (!usuarioAEliminar) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  const confirm = await usuariosService.deleteUser(id_usuario);
  if (confirm) return successResponse(res, usuarioAEliminar, 201);
  return errorResponse({ res, errorType: ERROR_CODES.INTERNAL_ERROR });
};

/**
 * Reactivar usuario eliminado con soft delete.
 */
export const reactivateUser = async (req, res) => {
  const { id_usuario } = matchedData(req, { locations: ['params'] });

  const usuarioAReactivar = await usuariosService.getByIdAll(id_usuario);
  if (!usuarioAReactivar) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  const confirm = await usuariosService.reactivateUser(id_usuario);

  return successResponse(res, confirm, 201);
};

/**
 * Modifica especialidad de médicos.
 */
// export const updateEspecialidad = async (req, res) => {
//   const { idMedico, idEspecialidad } = matchedData(req);

//   const result = await medicosService.updateEspecialidad(idMedico, idEspecialidad);

//   return successResponse(res, {
//     message: 'Especialidad actualizada correctamente',
//     ...result,
//   });
// };
