import { Router } from 'express';
import { validateListQuery } from '../middlewares/query.validator.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';
import * as especialidadesValidator from '../validators/especialidades.validator.ts';
import * as especialidadesController from '../controllers/especialidades.controller.ts';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.ts';
import {
  cacheMiddleware,
  clearCacheMiddleware,
  CACHE_DURATIONS,
} from '../middlewares/cache.middleware.ts';
import { ROLES } from '../constants/roles.constants.ts';

const EspecialidadesRouter = Router();

EspecialidadesRouter.route('/')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'especialidades'),
    validateListQuery(['id', 'nombre'], ['nombre']),
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

EspecialidadesRouter.route('/:id')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.getById,
  )
  .put(
    clearCacheMiddleware('especialidades'),
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateUpdate,
    validateRequest,
    especialidadesController.updateEspecialidad,
  )
  .delete(
    clearCacheMiddleware('especialidades'),
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.deleteEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

EspecialidadesRouter.route('/:id/medicos')
  .get(
    authenticateJwt,
    requireRole([ROLES.PACIENTE]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.getMedicosByEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET']));

export default EspecialidadesRouter;
