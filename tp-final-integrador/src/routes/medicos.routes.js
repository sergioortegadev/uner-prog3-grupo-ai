import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.js';
import * as medicosValidator from '../validators/medicos.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
// import { authenticate, authorize } from '../middlewares/auth.middleware.js';
// import { ROL } from '../constants/roles.constants.js';

const router = Router();

/**
 * Rutas para el módulo de Médicos.
 */

router
  .route('/:id_medico/obras-sociales')
  .post(
    // authenticate,
    // authorize([ROL.ADMIN]),
    medicosValidator.validateAsociarObrasSociales,
    validateRequest,
    medicosController.asociarObrasSociales,
  )
  .all(methodNotAllowedHandler(['POST']));

export default router;
