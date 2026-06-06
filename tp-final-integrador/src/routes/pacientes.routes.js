import { Router } from 'express';
import * as pacientesController from '../controllers/pacientes.controller.js';
//import * as pacienteValidator from '../validators/paciente.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';
import {
  cacheMiddleware,
  // clearCacheMiddleware,
  CACHE_DURATIONS,
} from '../middlewares/cache.middleware.js';

const router = Router();

/**
 * Rutas para el módulo de Pacientes.
 */

router
  .route('/')
  .get(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    cacheMiddleware(CACHE_DURATIONS.SHORT, 'pacientes'),
    //validateListQuery(['id', 'nombre', 'porcentajeDescuento', 'activo'], ['nombre']),
    validateRequest,
    pacientesController.getAll,
  )
  // .post(
  //   clearCacheMiddleware('pacientes'),
  //   authenticateJwt,
  //   requireRole([ROLES.ADMIN]),
  //   pacienteValidator.validateAssignObrasSociales,
  //   validateRequest,
  //   medicosController.assignObrasSociales,
  // )
  .all(methodNotAllowedHandler(['POST']));

export default router;
