import jwt from 'jsonwebtoken';
import * as usuariosModel from '../usuarios/usuarios.model.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Lógica de autenticación.
 */

/**
 * Inicia sesión de un usuario.
 * @param {string} email
 * @param {string} contrasenia
 * @returns {Promise<Object>} Token y datos del usuario.
 */
export const login = async (email, contrasenia) => {
  const user = await usuariosModel.findByEmailAndContrasenia(email, contrasenia);

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Credenciales inválidas');
  }

  // Generar Token
  const payload = {
    id: user.id_usuario,
    rol: user.rol,
    documento: user.documento,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  return {
    token,
    user,
  };
};
