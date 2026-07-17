import { Router } from 'express';
import { ROUTES } from '../../constants/routes.constants.ts';

import healthRoutes from '../health.routes.ts';
import authRoutes from '../auth.routes.ts';
import obrasSocialesRouter from '../obras_sociales.routes.ts';
import turnosRouter from '../turnos.routes.ts';
import medicosRouter from '../medicos.routes.ts';
import EspecialidadesRouter from '../especialidades.routes.ts';
import pacientesRouter from '../pacientes.routes.ts';
import usuariosRouter from '../usuarios.routes.ts';

const v1Router = Router();

/**
 * Enrutador central para la versión 1 de la API.
 */

v1Router.use(ROUTES.HEALTH, healthRoutes);
v1Router.use(ROUTES.AUTH, authRoutes);
v1Router.use(ROUTES.OBRAS_SOCIALES, obrasSocialesRouter);
v1Router.use(ROUTES.TURNOS, turnosRouter);
v1Router.use(ROUTES.MEDICOS, medicosRouter);
v1Router.use(ROUTES.ESPECIALIDADES, EspecialidadesRouter);
v1Router.use(ROUTES.PACIENTES, pacientesRouter);
v1Router.use(ROUTES.USUARIOS, usuariosRouter);

export default v1Router;
