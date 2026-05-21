import { Router } from 'express';
import * as medicosController from '../controllers/medicos.controller.js';
import * as medicosValidator from '../validators/medicos.validator.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
// import { authenticate, authorize } from '../middlewares/auth.middleware.js';
// import { ROL } from '../constants/roles.constants.js';

const router = Router();

/**
 * Ruta para asociar obras sociales a un médico.
 * Solo administradores deberían tener acceso (comentado por requerimiento).
 */
router.post(
  '/:id_medico/obras-sociales',
  // authenticate,
  // authorize([ROL.ADMIN]),
  medicosValidator.validateAsociarObrasSociales,
  validateRequest,
  medicosController.asociarObrasSociales,
);

export default router;
