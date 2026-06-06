import { Router } from 'express';
import { validateListQuery } from '../middlewares/query.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import * as especialidadesValidator from '../validators/especialidades.validator.js';
import * as especialidadesController from '../controllers/especialidades.controller.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { cacheMiddleware, clearCacheMiddleware, CACHE_DURATIONS } from '../middlewares/cache.middleware.js';
import { DB_STATUS } from '../constants/common.constants.js';
import { ROLES } from '../constants/roles.constants.js';

const EspecialidadesRouter = Router();

EspecialidadesRouter
  .route('/')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'especialidades'),
    validateListQuery(['id', 'nombre'], ['nombre']),
    validateRequest,
    especialidadesController.getAll,
  )
  .post(
    clearCacheMiddleware('especialidades'),
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateCreate,
    validateRequest,
    especialidadesController.createEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

EspecialidadesRouter
  .route('/:id')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.getById,
  )
  .put(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateUpdate,
    validateRequest,
    especialidadesController.updateEspecialidad,
  )
  .delete(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.deleteEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

export default EspecialidadesRouter;