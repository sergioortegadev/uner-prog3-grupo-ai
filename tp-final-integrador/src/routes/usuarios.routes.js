import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import * as usuariosValidator from '../validators/usuarios.validator.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const usuariosRouter = Router();

/**
 * Rutas para el módulo de Médicos.
 */
usuariosRouter
  .route('/')
  .get(authenticateJwt, requireRole([ROLES.ADMIN]), usuariosController.obtenerTodos)
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateNewUser,
    validateRequest,
    usuariosController.createAdminUser,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

usuariosRouter
  .route('/paciente')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateNewUser,
    validateRequest,
    usuariosController.createPatienceUser,
  )
  .all(methodNotAllowedHandler(['POST']));

usuariosRouter
  .route('/medico')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateNewDoctorUser,
    validateRequest,
    usuariosController.createDoctorUser,
  )
  .all(methodNotAllowedHandler(['POST']));

usuariosRouter
  .route('/:id_usuario')
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
    usuariosValidator.validateUpdateUser,
    validateRequest,
    // Aca va el multer ->  upload.single('foto'), y actualiza el foto_path con el nombre y ubicacion del archivo.
    usuariosController.updateUser,
  )
  .delete(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateGetById,
    validateRequest,
    usuariosController.deleteUser,
  )
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    usuariosValidator.validateGetById,
    validateRequest,
    usuariosController.reactivateUser,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE', 'POST']));

export default usuariosRouter;
