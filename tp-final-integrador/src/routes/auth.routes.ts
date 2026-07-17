import { Router } from 'express';
import * as authController from '../controllers/auth.controller.ts';
import { loginValidator } from '../validators/auth.validator.ts';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.ts';
import { authenticateLocal } from '../middlewares/auth.middleware.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';

const router = Router();

/**
 * Rutas para el módulo de autenticación.
 */

// POST /api/v1/auth/login
router
  .route('/login')
  .post(loginValidator, validateRequest, authenticateLocal, authController.login)
  .all(methodNotAllowedHandler(['POST']));

export default router;
