import jwt from 'jsonwebtoken';
import * as usuariosModel from '../database/usuarios.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Lógica de autenticación.
 */

/**
 * Inicia sesión de un usuario.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Token y datos del usuario.
 */
export const login = async (email, password) => {
  const user = await usuariosModel.findByCredentials(email, password);

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Credenciales inválidas');
  }

  const payload = {
    id: user.id,
    rol: user.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  return {
    token,
    user: {
      ...user,
      email,
    },
  };
};
