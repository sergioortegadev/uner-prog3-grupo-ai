import { Router } from 'express';
import * as medicosController from './medicos.controller.js';
import * as medicosValidator from './medicos.validator.js';
import { verifyToken, requireRole } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.constants.js';

const router = Router();

/**
 * Rutas para el módulo de médicos.
 * Prefijo: /api/v1/medicos
 */

// Listar médicos (Público autenticado para Pacientes y Admins)
router.get(
  '/',
  verifyToken,
  requireRole([ROLES.PACIENTE, ROLES.ADMIN]),
  medicosValidator.validateFindAll,
  medicosController.getMedicos,
);

// Actualizar especialidad de un médico (Solo Admin)
router.put(
  '/:id/especialidad',
  verifyToken,
  requireRole([ROLES.ADMIN]),
  medicosValidator.validateUpdateEspecialidad,
  medicosController.updateEspecialidad,
);

// Asociar obra social a un médico (Solo Admin)
router.post(
  '/:id/obras-sociales',
  verifyToken,
  requireRole([ROLES.ADMIN]),
  medicosValidator.validateObraSocial,
  medicosController.addObraSocial,
);

// Desvincular obra social de un médico (Solo Admin)
router.delete(
  '/:id/obras-sociales/:id_obra_social',
  verifyToken,
  requireRole([ROLES.ADMIN]),
  medicosValidator.validateRemoveObraSocial,
  medicosController.removeObraSocial,
);

export default router;
