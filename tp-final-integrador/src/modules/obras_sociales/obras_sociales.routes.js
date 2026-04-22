import { Router } from 'express';
import * as obrasSocialesController from './obras_sociales.controller.js';
import * as obrasSocialesValidator from './obras_sociales.validator.js';
import { ROLES } from '../../constants/roles.constants.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../../middlewares/method.middleware.js';

const obrasSocialesRouter = Router();

/**
 * Rutas para el módulo de obras sociales.
 * Todas las rutas requieren autenticación y rol de Administrador.
 */

// Middleware global para todas las rutas de este router
obrasSocialesRouter.use(verifyToken);
obrasSocialesRouter.use(requireRole([ROLES.ADMIN]));

obrasSocialesRouter
  .route('/')
  .get(obrasSocialesController.getAll)
  .post(
    obrasSocialesValidator.validateCreate,
    validateRequest,
    obrasSocialesController.createObraSocial,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

obrasSocialesRouter
  .route('/:id')
  .get(obrasSocialesValidator.validateId, validateRequest, obrasSocialesController.getById)
  .put(
    obrasSocialesValidator.validateUpdate,
    validateRequest,
    obrasSocialesController.updateObraSocial,
  )
  .delete(
    obrasSocialesValidator.validateId,
    validateRequest,
    obrasSocialesController.removeObraSocial,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

export { obrasSocialesRouter };
