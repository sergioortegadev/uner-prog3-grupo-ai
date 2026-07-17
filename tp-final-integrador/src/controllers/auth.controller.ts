import { successResponse } from '../helpers/response.helper.ts';

/**
 * Controladores para el módulo de autenticación.
 */

/**
 * Maneja el inicio de sesión.
 */
export const login = async (req, res) => {
  const { token } = req.user;

  return successResponse(res, { token });
};
