import * as healthModel from './health.model.js';

/**
 * Obtiene el reporte completo de salud del sistema
 * @returns {Promise<Object>} Datos del reporte de salud
 */
export const checkSystemHealth = async () => {
  try {
    const [version, maxConnections, activeConnections] = await Promise.all([
      healthModel.getDatabaseVersion(),
      healthModel.getMaxConnections(),
      healthModel.getActiveConnections(),
    ]);

    return {
      status: 'success',
      message: 'La API de Prog III está funcionando correctamente',
      database: {
        status: 'conectado',
        version,
        max_connections: maxConnections,
        active_connections: activeConnections,
      },
    };
  } catch (error) {
    // Si la DB falla, el servicio toma la decisión de reportar el error
    return {
      status: 'error',
      message: 'La API está activa pero hay problemas con la base de datos',
      database: {
        status: 'desconectado',
        error: error.message,
      },
    };
  }
};
