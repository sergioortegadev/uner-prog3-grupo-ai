import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import * as usuariosValidator from '../validators/usuarios.validator.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { uploadImage } from '../middlewares/multer.middleware.js';

const usuariosRouter = Router();

/**
 * Rutas para el módulo de Usuarios.
 */
usuariosRouter
  .route('/')
  .get(authenticateJwt, requireRole([ROLES.ADMIN]), usuariosController.findAll)
  .all(methodNotAllowedHandler(['GET']));

usuariosRouter
  .route('/admin')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    uploadImage.single('foto'),
    usuariosValidator.validateNewUser,
    validateRequest,
    usuariosController.createAdminUser,
  )
  .all(methodNotAllowedHandler(['POST']));

usuariosRouter
  .route('/paciente')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    uploadImage.single('foto'),
    usuariosValidator.validateNewUser,
    validateRequest,
    usuariosController.createPacienteUser,
  )
  .all(methodNotAllowedHandler(['POST']));

usuariosRouter
  .route('/medico')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    uploadImage.single('foto'),
    usuariosValidator.validateNewDoctorUser,
    validateRequest,
    usuariosController.createDoctorUser,
  )
  .all(methodNotAllowedHandler(['POST']));

usuariosRouter
  .route('/:idUsuario')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateGetById,
    validateRequest,
    usuariosController.getById,
  )
  .put(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    uploadImage.single('foto'),
    usuariosValidator.validateUpdateUser,
    validateRequest,
    usuariosController.updateUser,
  )
  .delete(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateGetById,
    validateRequest,
    usuariosController.deleteUser,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

usuariosRouter
  .route('/:idUsuario/reactivar')
  .patch(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateGetById,
    validateRequest,
    usuariosController.reactivateUser,
  )
  .all(methodNotAllowedHandler(['PATCH']));

export default usuariosRouter;
