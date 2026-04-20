import * as healthService from './health.service.js';
import { successResponse, errorResponse } from '../../helpers/response.helper.js';
import { ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Controlador para el health check del sistema
 * No requiere try/catch gracias a Express 5+
 */
export const getHealth = async (req, res) => {
  const healthReport = await healthService.checkSystemHealth();

  // Si el servicio reporta error en la DB, respondemos con 503
  if (healthReport.status === 'error') {
    return errorResponse(
      res,
      healthReport.mensaje,
      ERROR_CODES.DATABASE_ERROR,
      healthReport.database,
    );
  }

  // Respuesta de éxito formateada
  return successResponse(res, {
    ...healthReport,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
};
