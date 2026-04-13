import * as authService from './auth.service.js';
import { successResponse } from '../../helpers/response.helper.js';

/**
 * Controladores para el módulo de autenticación.
 */

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  return successResponse(res, result);
};
