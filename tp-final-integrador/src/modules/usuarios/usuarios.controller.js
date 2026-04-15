import { matchedData } from 'express-validator';
import * as usuariosService from './usuarios.service.js';
import { successResponse } from '../../helpers/response.helper.js';

/**
 * Controladores para el módulo de usuarios.
 */

export const register = async (req, res) => {
  const data = matchedData(req);
  const user = await usuariosService.registrarUsuario(data);

  return successResponse(res, user, 201);
};
