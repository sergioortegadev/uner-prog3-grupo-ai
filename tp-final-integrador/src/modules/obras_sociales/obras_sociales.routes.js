import { Router } from 'express';
import * as obrasSocialesController from './obras_sociales.controller.js';
import * as obrasSocialesValidator from './obras_sociales.validator.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';

const obrasSocialesRouter = Router();

// Middleware global para todas las rutas de este router
obrasSocialesRouter.use(verifyToken);

// Rutas accesibles para Administrador (3)
obrasSocialesRouter.get('/', 
  requireRole([3]), 
  obrasSocialesController.getAll
);

obrasSocialesRouter.get('/:id', 
  requireRole([3]), 
  obrasSocialesValidator.validateId,
  validateRequest,
  obrasSocialesController.getById
);

obrasSocialesRouter.post('/', 
  requireRole([3]), 
  obrasSocialesValidator.validateCreate,
  validateRequest,
  obrasSocialesController.createObraSocial
);

obrasSocialesRouter.put('/:id', 
  requireRole([3]), 
  obrasSocialesValidator.validateUpdate,
  validateRequest,
  obrasSocialesController.updateObraSocial
);

obrasSocialesRouter.delete('/:id', 
  requireRole([3]), 
  obrasSocialesValidator.validateId,
  validateRequest,
  obrasSocialesController.removeObraSocial
);

export { obrasSocialesRouter };
