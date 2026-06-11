import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.js';
import * as turnosValidator from '../validators/turnos.validator.js';
import { ROLES } from '../constants/roles.constants.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { validateListQuery } from '../middlewares/query.validator.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';

const turnosRouter = Router();

/**
 * Rutas para el módulo de Turnos.
 */

turnosRouter.use(authenticateJwt);

turnosRouter
  .route('/')
  .get(
    requireRole([ROLES.MEDICO, ROLES.PACIENTE]),
    validateListQuery(['fecha_hora'], ['atendido']),
    validateRequest,
    turnosController.getMyAppointments,
  )
  .post(
    requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
    turnosValidator.validateCreateAppointment,
    validateRequest,
    turnosController.createAppointment,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

turnosRouter
  .route('/estadisticas')
  .get(
    requireRole([ROLES.ADMIN]),
    turnosValidator.validateStatistics,
    validateRequest,
    turnosController.getStatistics,
  )
  .all(methodNotAllowedHandler(['GET']));

turnosRouter
  .route('/:id/atendido')
  .patch(
    requireRole([ROLES.MEDICO]),
    turnosValidator.validateMarkAsAttended,
    validateRequest,
    turnosController.markAsAttended,
  )
  .all(methodNotAllowedHandler(['PATCH']));

export default turnosRouter;
