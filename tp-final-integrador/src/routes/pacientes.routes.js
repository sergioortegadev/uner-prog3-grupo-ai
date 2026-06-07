import { Router } from 'express';
import * as pacientesController from '../controllers/pacientes.controller.js';
import * as pacienteValidator from '../validators/pacientes.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';
import {
  cacheMiddleware,
  clearCacheMiddleware,
  CACHE_DURATIONS,
} from '../middlewares/cache.middleware.js';

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
    validateRequest,
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
  .post(
    clearCacheMiddleware('pacientes'),
    pacienteValidator.validateId,
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    pacienteValidator.validateAssignObrasSociales,
    validateRequest,
    pacientesController.assignObraSocial,
  )
  .all(methodNotAllowedHandler(['POST']));

export default pacientesRouter;
