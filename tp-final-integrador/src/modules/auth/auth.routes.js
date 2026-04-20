import { Router } from 'express';
import * as authController from './auth.controller.js';
import { loginValidator } from './auth.validator.js';

const router = Router();

/**
 * Rutas para el módulo de autenticación.
 */

// POST /api/v1/auth/login
router.post('/login', loginValidator, authController.login);

export default router;
