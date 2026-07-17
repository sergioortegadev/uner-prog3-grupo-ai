import { Router } from 'express';
import * as pacientesController from '../controllers/pacientes.controller.ts';
import * as pacienteValidator from '../validators/pacientes.validator.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.ts';
import { ROLES } from '../constants/roles.constants.ts';
import {
  cacheMiddleware,
  clearCacheMiddleware,
  CACHE_DURATIONS,
} from '../middlewares/cache.middleware.ts';

const pacientesRouter = Router();

/**
 * Rutas para el módulo de Pacientes.
 */

pacientesRouter
  .route('/')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'pacientes'),
    pacientesController.getAll,
  )
  .all(methodNotAllowedHandler(['GET']));

pacientesRouter
  .route('/:id_paciente')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    pacienteValidator.validateId,
    validateRequest,
    pacientesController.getById,
  )
  .all(methodNotAllowedHandler(['GET']));

pacientesRouter
  .route('/:id_paciente/:id_obra_social')
  .patch(
    clearCacheMiddleware('pacientes'),
    pacienteValidator.validateId,
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    pacienteValidator.validateAssignObrasSociales,
    validateRequest,
    pacientesController.assignObraSocial,
  )
  .all(methodNotAllowedHandler(['PATCH']));

export default pacientesRouter;
