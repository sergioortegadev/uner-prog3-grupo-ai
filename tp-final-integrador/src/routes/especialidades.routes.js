import { Router } from 'express';
import * as especialidadesController from '../controllers/especialidades.controller.js';
import * as especialidadesValidator from '../validators/especialidades.validator.js';
import { validateListQuery } from '../middlewares/query.validator.js';
import { ROLES } from '../constants/roles.constants.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';

const especialidadesRouter = Router();

/**
 * Rutas para el módulo de especialidades.
 * Todas las rutas requieren autenticación.
 * Solo Administrador puede Crear, Editar o Eliminar.
 * Pacientes pueden listar.
 */

especialidadesRouter.use(verifyToken);

especialidadesRouter
  .route('/')
  .get(
    validateListQuery(['id_especialidad', 'nombre', 'activo'], ['nombre']),
    validateRequest,
    especialidadesController.getAll,
  )
  .post(
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateCreate,
    validateRequest,
    especialidadesController.createEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET', 'POST']));

especialidadesRouter
  .route('/:id')
  .get(especialidadesValidator.validateId, validateRequest, especialidadesController.getById)
  .put(
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateUpdate,
    validateRequest,
    especialidadesController.updateEspecialidad,
  )
  .delete(
    requireRole([ROLES.ADMIN]),
    especialidadesValidator.validateId,
    validateRequest,
    especialidadesController.removeEspecialidad,
  )
  .all(methodNotAllowedHandler(['GET', 'PUT', 'DELETE']));

export default especialidadesRouter;
