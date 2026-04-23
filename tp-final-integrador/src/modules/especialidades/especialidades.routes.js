import { Router } from 'express';
import * as especialidadesController from './especialidades.controller.js';
import * as especialidadesValidator from './especialidades.validator.js';
import { ROLES } from '../../constants/roles.constants.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';

const especialidadesRouter = Router();

/**
 * Rutas para el módulo de especialidades.
 */

// Todas las rutas requieren autenticación
especialidadesRouter.use(verifyToken);

// Listado accesible por Admin y Paciente
especialidadesRouter.get(
  '/',
  requireRole([ROLES.ADMIN, ROLES.PACIENTE]),
  especialidadesController.getAll,
);

// El resto de las rutas son solo para Administrador
especialidadesRouter.get(
  '/:id',
  requireRole([ROLES.ADMIN]),
  especialidadesValidator.validateId,
  validateRequest,
  especialidadesController.getById,
);

especialidadesRouter.post(
  '/',
  requireRole([ROLES.ADMIN]),
  especialidadesValidator.validateCreate,
  validateRequest,
  especialidadesController.createEspecialidad,
);

especialidadesRouter.put(
  '/:id',
  requireRole([ROLES.ADMIN]),
  especialidadesValidator.validateUpdate,
  validateRequest,
  especialidadesController.updateEspecialidad,
);

especialidadesRouter.delete(
  '/:id',
  requireRole([ROLES.ADMIN]),
  especialidadesValidator.validateId,
  validateRequest,
  especialidadesController.removeEspecialidad,
);

export default especialidadesRouter;
