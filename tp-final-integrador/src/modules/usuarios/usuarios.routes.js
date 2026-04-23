import { Router } from 'express';
import * as usuariosController from './usuarios.controller.js';
import { registerValidator } from './usuarios.validator.js';
import { uploadFotoUsuario } from '../../middlewares/upload.middleware.js';

const router = Router();

/**
 * Rutas para el módulo de usuarios.
 */

// POST /api/v1/usuarios
router.post('/', uploadFotoUsuario, registerValidator, usuariosController.register);

export default router;
