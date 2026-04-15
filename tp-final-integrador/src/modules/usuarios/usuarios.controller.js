import { matchedData } from 'express-validator';
import * as usuariosService from './usuarios.service.js';
import { successResponse } from '../../helpers/response.helper.js';
import { UPLOAD_CONFIG } from '../../config/upload.config.js';

/**
 * Controladores para el módulo de usuarios.
 */

export const register = async (req, res) => {
  const data = matchedData(req);

  let fotoPath = null;
  if (req.file) {
    fotoPath = `${UPLOAD_CONFIG.URL_PREFIX}/${req.file.filename}`;
  }

  const user = await usuariosService.registrarUsuario({ ...data, foto_path: fotoPath });

  return successResponse(res, user, 201);
};
