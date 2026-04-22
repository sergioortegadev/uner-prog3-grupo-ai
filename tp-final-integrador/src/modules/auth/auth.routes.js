import { Router } from 'express';
import * as authController from './auth.controller.js';
import { loginValidator } from './auth.validator.js';
import { methodNotAllowedHandler } from '../../middlewares/method.middleware.js';

const router = Router();

/**
 * Rutas para el módulo de autenticación.
 */

// POST /api/v1/auth/login
router
  .route('/login')
  .post(loginValidator, authController.login)
  .all(methodNotAllowedHandler(['POST']));

export default router;
