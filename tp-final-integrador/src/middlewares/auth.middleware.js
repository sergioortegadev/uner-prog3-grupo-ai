import jwt from 'jsonwebtoken';
import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.UNAUTHORIZED,
      message: 'No se proporcionó un token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    return errorResponse({
      res,
      errorType: ERROR_CODES.UNAUTHORIZED,
      message: 'Token inválido o expirado',
    });
  }
};

/**
 * Middleware para requerir un rol específico
 * @param {Array<number>} roles - Lista de roles permitidos
 */
export const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return errorResponse({ res, errorType: ERROR_CODES.UNAUTHORIZED });
    }

    if (!roles.includes(req.user.rol)) {
      return errorResponse({ res, errorType: ERROR_CODES.FORBIDDEN });
    }

    next();
  };
};
