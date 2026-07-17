import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.ts';
import * as medicosValidator from '../validators/medicos.validator.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.ts';
import { ROLES } from '../constants/roles.constants.ts';

const medicosRouter = Router();

/**
 * Rutas para el módulo de Médicos.
 */
medicosRouter
  .route('/')
  .get(authenticateJwt, requireRole([ROLES.PACIENTE]), medicosController.obtenerTodos)
  .all(methodNotAllowedHandler(['GET']));

medicosRouter
  .route('/:idMedico/obras-sociales')
  .post(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    medicosValidator.validateAssignObrasSociales,
    validateRequest,
    medicosController.assignObrasSociales,
  )
  .all(methodNotAllowedHandler(['POST']));

medicosRouter
  .route('/:idMedico/especialidad')
  .patch(
    authenticateJwt,
    requireRole([ROLES.ADMIN]),
    medicosValidator.validateUpdateEspecialidad,
    validateRequest,
    medicosController.updateEspecialidad,
  )
  .all(methodNotAllowedHandler(['PATCH']));

export default medicosRouter;
