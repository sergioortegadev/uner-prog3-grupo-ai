import { matchedData } from 'express-validator';
import * as pacientesService from './pacientes.service.js';
import { successResponse } from '../../helpers/response.helper.js';

/**
 * Controladores para el módulo de pacientes.
 */

export const updateObraSocial = async (req, res) => {
  const { id } = req.params;
  const { id_obra_social } = matchedData(req);
  await pacientesService.actualizarObraSocial(id, id_obra_social);
  return successResponse(res, { message: 'Obra social de paciente actualizada correctamente' });
};
