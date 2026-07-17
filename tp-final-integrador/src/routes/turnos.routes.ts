import { Router } from 'express';
import * as turnosController from '../controllers/turnos.controller.ts';
import * as turnosValidator from '../validators/turnos.validator.ts';
import { ROLES } from '../constants/roles.constants.ts';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import { validateListQuery } from '../middlewares/query.validator.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';

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
  .route('/estadisticas/medicos')
  .get(requireRole([ROLES.ADMIN]), turnosController.getStatisticsPDFMedicos)
  .all(methodNotAllowedHandler(['GET']));

turnosRouter
  .route('/estadisticas/fecha')
  .get(requireRole([ROLES.ADMIN]), turnosController.getStatisticsPDFFecha)
  .all(methodNotAllowedHandler(['GET']));

turnosRouter
  .route('/estadisticas/especialidad')
  .get(requireRole([ROLES.ADMIN]), turnosController.getStatisticsPDFEspecialidad)
  .all(methodNotAllowedHandler(['GET']));

turnosRouter
  .route('/estadisticas/paciente/:id_paciente')
  .get(
    requireRole([ROLES.ADMIN]),
    turnosValidator.validateStatisticsPaciente,
    validateRequest,
    turnosController.getStatisticsPDFPaciente,
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
