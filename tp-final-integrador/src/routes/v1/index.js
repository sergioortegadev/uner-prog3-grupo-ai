import { Router } from 'express';
import { ROUTES } from '../../constants/routes.constants.js';

import healthRoutes from '../health.routes.js';
import authRoutes from '../auth.routes.js';
import obrasSocialesRouter from '../obras_sociales.routes.js';
import medicosRouter from '../medicos.routes.js';

const v1Router = Router();

/**
 * Enrutador central para la versión 1 de la API.
 */

v1Router.use(ROUTES.HEALTH, healthRoutes);
v1Router.use(ROUTES.AUTH, authRoutes);
v1Router.use(ROUTES.OBRAS_SOCIALES, obrasSocialesRouter);
v1Router.use(ROUTES.MEDICOS, medicosRouter);

export default v1Router;
