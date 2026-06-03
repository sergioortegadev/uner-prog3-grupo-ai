import { Router } from 'express';
import * as obrasSocialesController from '../controllers/obras_sociales.controller.js';
import * as obrasSocialesValidator from '../validators/obras_sociales.validator.js';
import { validateListQuery } from '../middlewares/query.validator.js';
// import { ROLES } from '../constants/roles.constants.js';
// import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  cacheMiddleware,
  clearCacheMiddleware,
  CACHE_DURATIONS,
} from '../middlewares/cache.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';

const obrasSocialesRouter = Router();

/**
 * Rutas para el módulo de obras sociales.
 * Todas las rutas requieren autenticación y rol de Administrador.
 */

// Middleware global para todas las rutas de este router
// obrasSocialesRouter.use(verifyToken);
// obrasSocialesRouter.use(requireRole([ROLES.ADMIN]));

obrasSocialesRouter
  .route('/')
  .get(
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'obras-sociales'),
    validateListQuery(['id', 'nombre', 'porcentajeDescuento', 'activo'], ['nombre']),
    validateRequest,
    obrasSocialesController.getAll,
  )
  .post(
    clearCacheMiddleware('obras-sociales'),
    obrasSocialesValidator.validateCreate,
    validateRequest,
    obrasSocialesController.createObraSocial,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

obrasSocialesRouter
  .route('/:id')
  .get(
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'obras-sociales'),
    obrasSocialesValidator.validateId,
    validateRequest,
    obrasSocialesController.getById,
  )
  .put(
    clearCacheMiddleware('obras-sociales'),
    obrasSocialesValidator.validateUpdate,
    validateRequest,
    obrasSocialesController.updateObraSocial,
  )
  .delete(
    clearCacheMiddleware('obras-sociales'),
    obrasSocialesValidator.validateId,
    validateRequest,
    obrasSocialesController.removeObraSocial,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

export default obrasSocialesRouter;
