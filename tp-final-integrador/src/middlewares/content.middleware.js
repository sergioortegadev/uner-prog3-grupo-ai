import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para validar que el Content-Type sea application/json
 * en peticiones que modifican datos (POST, PUT, PATCH).
 */
const validateContentType = (req, res, next) => {
  // Solo validamos si es un método de escritura y SI tiene contenido
  const hasBody =
    req.headers['content-length'] > 0 || req.headers['transfer-encoding'] !== undefined;

  if (!hasBody) return next();

  const contentType = req.headers['content-type'];
  const allowedTypes = ['application/json', 'multipart/form-data'];

  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    (!contentType || !allowedTypes.some((type) => contentType.startsWith(type)))
  ) {
    return errorResponse({ res, errorType: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE });
  }
  next();
};

export default validateContentType;
