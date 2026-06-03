import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.js';
import * as medicosValidator from '../validators/medicos.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = Router();

/**
 * Rutas para el módulo de Médicos.
 */

router
  .route('/:id_medico/obras-sociales')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    medicosValidator.validateAsociarObrasSociales,
    validateRequest,
    medicosController.asociarObrasSociales,
  )
  .all(methodNotAllowedHandler(['POST']));

export default router;
