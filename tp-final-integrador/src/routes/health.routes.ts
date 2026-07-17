import { Router } from 'express';
import * as healthController from '../controllers/health.controller.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';

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
