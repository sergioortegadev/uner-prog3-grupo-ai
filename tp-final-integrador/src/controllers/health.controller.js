import * as healthService from '../services/health.service.js';
import { successResponse, errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';
import { HEALTH_STATUS, APP_CONFIG } from '../constants/common.constants.js';

/**
 * Controlador para el health check del sistema
 * No requiere try/catch gracias a Express 5+
 */
export const getHealth = async (req, res) => {
  const healthReport = await healthService.checkSystemHealth();

  // Si el servicio reporta error en la DB, respondemos con 503
  if (healthReport.status === HEALTH_STATUS.ERROR) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.DATABASE_ERROR,
      message: healthReport.mensaje,
      details: healthReport.database,
    });
  }

  // Respuesta de éxito formateada
  return successResponse(res, {
    ...healthReport,
    timestamp: new Date().toISOString(),
    version: APP_CONFIG.VERSION,
  });
};
