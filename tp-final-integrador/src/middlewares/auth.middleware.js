import jwt from 'jsonwebtoken';
import { errorResponse } from '../helpers/response.helper.js';
import { ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(
      res,
      'No se proporcionó un token de autenticación',
      ERROR_CODES.UNAUTHORIZED,
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    return errorResponse(res, 'Token inválido o expirado', ERROR_CODES.UNAUTHORIZED);
  }
};

/**
 * Middleware para requerir un rol específico
 * @param {Array<number>} roles - Lista de roles permitidos
 */
export const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'No autenticado', ERROR_CODES.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.rol)) {
      return errorResponse(
        res,
        'No tiene permisos para realizar esta acción',
        ERROR_CODES.FORBIDDEN,
      );
    }

    next();
  };
};
