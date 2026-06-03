import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { loginValidator } from '../validators/auth.validator.js';
import { methodNotAllowedHandler } from '../middlewares/method-not-allowed.middleware.js';
import { authenticateLocal } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * Rutas para el módulo de autenticación.
 */

// POST /api/v1/auth/login
router
  .route('/login')
  .post(loginValidator, authenticateLocal, authController.login)
  .all(methodNotAllowedHandler(['POST']));

export default router;
