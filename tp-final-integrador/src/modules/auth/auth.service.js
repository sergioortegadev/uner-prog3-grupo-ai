import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import * as usuariosModel from '../usuarios/usuarios.model.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

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
  const user = await usuariosModel.findByEmail(email);

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Credenciales inválidas');
  }

  const isPasswordValid = await bcryptjs.compare(password, user.contrasenia);

  if (!isPasswordValid) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, 'Credenciales inválidas');
  }

  // Generar Token
  const payload = {
    id: user.id_usuario,
    rol: user.rol,
    documento: user.documento,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
  // eslint-disable-next-line no-unused-vars
  const { contrasenia: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};
