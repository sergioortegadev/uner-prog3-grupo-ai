import { Router } from 'express';
import * as especialidadesController from './especialidades.controller.js';
import * as especialidadesValidator from './especialidades.validator.js';
import { ROLES } from '../../constants/roles.constants.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';

const especialidadesRouter = Router();

/**
 * Rutas para el módulo de especialidades.
 * Todas las rutas requieren autenticación y rol de Administrador.
 */

// Middleware global para todas las rutas de este router
especialidadesRouter.use(verifyToken);
especialidadesRouter.use(requireRole([ROLES.ADMIN]));

especialidadesRouter.get('/', especialidadesController.getAll);

especialidadesRouter.get(
  '/:id',
  especialidadesValidator.validateId,
  validateRequest,
  especialidadesController.getById,
);

especialidadesRouter.post(
  '/',
  especialidadesValidator.validateCreate,
  validateRequest,
  especialidadesController.createEspecialidad,
);

especialidadesRouter.put(
  '/:id',
  especialidadesValidator.validateUpdate,
  validateRequest,
  especialidadesController.updateEspecialidad,
);

especialidadesRouter.delete(
  '/:id',
  especialidadesValidator.validateId,
  validateRequest,
  especialidadesController.removeEspecialidad,
);

export { especialidadesRouter };
