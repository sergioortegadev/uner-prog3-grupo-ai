/**
 * Clase base para errores operacionales de la aplicación.
 */
export class AppError extends Error {
  /**
   * @param {Object} errorConfig - Configuración del error desde ERROR_CODES
   * @param {string} [customMessage] - Mensaje personalizado (opcional)
   * @param {Array|Object} [details] - Detalles adicionales del error (opcional)
   */
  constructor(errorConfig, customMessage = null, details = []) {
    // Usamos el mensaje del diccionario o uno personalizado si se provee
    super(customMessage || errorConfig.message || 'Error en la aplicación');

    this.code = errorConfig.code;
    this.status = errorConfig.status;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
