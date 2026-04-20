import { Router } from 'express';
import * as healthController from './health.controller.js';

const router = Router();

/**
 * @route GET /api/v1/health
 * @desc Reporte de salud completo del sistema
 */
router.get('/', healthController.getHealth);

export default router;
