import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.js';
import * as medicosValidator from '../validators/medicos.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const medicosRouter = Router();

/**
 * Rutas para el módulo de Médicos.
 */
medicosRouter
  .route('/')
  .get(authenticateJwt, requireRole([ROLES.PACIENTE]), medicosController.obtenerTodos)
  .all(methodNotAllowedHandler(['GET']));

medicosRouter
  .route('/especialidad/:id_especialidad')
  .get(
    authenticateJwt,
    requireRole([ROLES.PACIENTE, ROLES.ADMIN]),
    medicosValidator.validateEspecialidadId,
    validateRequest,
    medicosController.obtenerPorEspecialidad,
  )
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
