import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.js';
import * as turnosValidator from '../validators/turnos.validator.js';
import { ROLES } from '../constants/roles.constants.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';

const turnosRouter = Router();

/**
 * Rutas para el módulo de Turnos.
 * Solo el Administrador (Role 3) puede registrar turnos.
 */

turnosRouter.use(verifyToken);
turnosRouter.use(requireRole([ROLES.ADMIN]));

turnosRouter
  .route('/')
  .post(turnosValidator.validateRegistrarTurno, validateRequest, turnosController.registrarTurno)
  .all(methodNotAllowedHandler(['POST']));

export default turnosRouter;
