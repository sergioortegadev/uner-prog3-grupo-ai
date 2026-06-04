import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.js';
import * as turnosValidator from '../validators/turnos.validator.js';
import { ROLES } from '../constants/roles.constants.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';

const turnosRouter = Router();

/**
 * Rutas para el módulo de Turnos.
 */

turnosRouter.use(authenticateJwt);

turnosRouter
  .route('/')
  .get(requireRole([ROLES.MEDICO, ROLES.PACIENTE]), turnosController.listarTurnosPropios)
  .post(
    requireRole([ROLES.ADMIN]),
    turnosValidator.validateRegistrarTurno,
    validateRequest,
    turnosController.registrarTurno,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

export default turnosRouter;
