import { Router } from 'express';
import * as usuariosController from './usuarios.controller.js';
import { registerValidator } from './usuarios.validator.js';

const router = Router();

/**
 * Rutas para el módulo de usuarios.
 */

// POST /api/v1/usuarios
router.post('/', registerValidator, usuariosController.register);

export default router;
