import { Router } from 'express';
import * as pacientesController from './pacientes.controller.js';
import * as pacientesValidator from './pacientes.validator.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.constants.js';

const router = Router();

/**
 * Rutas para el módulo de pacientes.
 * Prefijo: /api/v1/pacientes
 */

// Actualizar obra social de un paciente (Solo Admin)
router.put(
  '/:id/obra-social',
  verifyToken,
  requireRole([ROLES.ADMIN]),
  pacientesValidator.validateUpdateObraSocial,
  pacientesController.updateObraSocial,
);

export default router;
