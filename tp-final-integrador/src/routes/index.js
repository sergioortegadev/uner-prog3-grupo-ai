import { Router } from 'express';
import { API_PREFIX, V1_PREFIX } from '../constants/routes.constants.js';
import v1Router from './v1/index.js';

const apiRouter = Router();

/**
 * Enrutador maestro de la API.
 * Encapsula el versionado y los prefijos globales.
 */

apiRouter.use(`${API_PREFIX}${V1_PREFIX}`, v1Router);

export default apiRouter;
