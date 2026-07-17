import { matchedData } from 'express-validator';
import * as usuariosService from '../services/usuarios.service.ts';
import { errorResponse, successResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

/**
 * Controlador para el módulo de Usuarios
 */

/**
 * Obtiene el listado de todos los usuarios.
 */
export const findAll = async (req, res) => {
  const result = await usuariosService.findAll();

  return successResponse(res, result, 200);
};

/**
 * Busca usuario ACTIVO por idUsuario
 */
export const getById = async (req, res) => {
  const { idUsuario } = matchedData(req);

  const result = await usuariosService.getById(idUsuario);
  if (!result) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  return successResponse(res, result);
};

/**
 * Modifica Usuario
 */
export const updateUser = async (req, res) => {
  const { idUsuario } = matchedData(req, { locations: ['params'] });
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  if (req.file) {
    userDatosNuevos.foto_path = req.file.filename;
  }

  const usuarioActualizado = await usuariosService.updateUser(idUsuario, userDatosNuevos);

  return successResponse(res, usuarioActualizado, 200);
};
/**
 * Crea Usuario Admin
 */
export const createAdminUser = async (req, res) => {
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  if (req.file) {
    userDatosNuevos.foto_path = req.file.filename;
  }

  const nuevoUsuarioAdminCreado = await usuariosService.createAdminUser(userDatosNuevos);

  if (!nuevoUsuarioAdminCreado) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }

  return successResponse(res, nuevoUsuarioAdminCreado, 201);
};
/**
 * Crea Usuario Paciente
 */
export const createPacienteUser = async (req, res) => {
  const userDatosNuevos = matchedData(req, { locations: ['body'] });

  if (req.file) {
    userDatosNuevos.foto_path = req.file.filename;
  }

  const nuevoUsuarioPacienteCreado = await usuariosService.createPacienteUser(userDatosNuevos);

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

  if (req.file) {
    userDatosNuevos.foto_path = req.file.filename;
  }

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
  const { idUsuario } = matchedData(req, { locations: ['params'] });

  const usuarioAEliminar = await usuariosService.getById(idUsuario);
  if (!usuarioAEliminar) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  const confirm = await usuariosService.deleteUser(idUsuario);
  if (!confirm) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.INTERNAL_ERROR,
      message: 'No se pudo eliminar el usuario',
    });
  }

  return successResponse(res, usuarioAEliminar, 200);
};

/**
 * Reactivar usuario eliminado con soft delete.
 */
export const reactivateUser = async (req, res) => {
  const { idUsuario } = matchedData(req, { locations: ['params'] });

  const usuarioAReactivar = await usuariosService.getByIdAll(idUsuario);
  if (!usuarioAReactivar) {
    return errorResponse({ res, errorType: ERROR_CODES.NOT_FOUND });
  }
  const confirm = await usuariosService.reactivateUser(idUsuario);

  if (!confirm) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.INTERNAL_ERROR,
      message: 'No se pudo reactivar el usuario',
    });
  }

  return successResponse(res, confirm, 200);
};
