import passport from 'passport';
import { errorResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

/**
 * Middleware para autenticar solicitudes mediante token JWT
 */
export const authenticateJwt = async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse({
        res,
        errorType: ERROR_CODES.INTERNAL_ERROR,
      });
    }

    if (!user) {
      let message = 'Token inválido o expirado';
      if (info && info.message === 'No auth token') {
        message = 'No se proporcionó un token';
      } else if (info && (info.name === 'TokenExpiredError' || info.message === 'jwt expired')) {
        message = 'Token expirado';
      }
      return errorResponse({
        res,
        errorType: ERROR_CODES.UNAUTHORIZED,
        message,
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware para autenticar credenciales locales (email/contraseña)
 */
export const authenticateLocal = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return errorResponse({
        res,
        errorType: ERROR_CODES.UNAUTHORIZED,
        message: info?.message || ERROR_CODES.UNAUTHORIZED.message,
      });
    }
    req.user = user;
    next();
  })(req, res, next);
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
