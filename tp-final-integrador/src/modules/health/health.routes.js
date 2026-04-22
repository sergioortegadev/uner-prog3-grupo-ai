import { Router } from 'express';
import * as healthController from './health.controller.js';
import { methodNotAllowedHandler } from '../../middlewares/method.middleware.js';

const router = Router();

/**
 * @route GET /api/v1/health
 * @desc Reporte de salud completo del sistema
 */
router
  .route('/')
  .get(healthController.getHealth)
  .all(methodNotAllowedHandler(['GET']));

export default router;
