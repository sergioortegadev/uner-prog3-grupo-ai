import { matchedData } from 'express-validator';
import * as authService from './auth.service.js';
import { successResponse } from '../../helpers/response.helper.js';

/**
 * Controladores para el módulo de autenticación.
 */

/**
 * Maneja el inicio de sesión.
 */
export const login = async (req, res) => {
  const { email, contrasenia } = matchedData(req);
  const result = await authService.login(email, contrasenia);

  return successResponse(res, result);
};
