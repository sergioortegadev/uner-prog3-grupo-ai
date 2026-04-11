import { errorResponse, ERROR_CODES } from '../helpers/response.helper.js';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = async (req, res, next) => {
  // TODO: Implementar lógica real con jsonwebtoken
  req.user = {
    id: 8, // Benito Fernandez (Admin de la base de datos)
    rol: 3,
    documento: '51000111',
  };

  next();
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
