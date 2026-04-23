import * as pacientesModel from './pacientes.model.js';
import * as usuariosModel from '../usuarios/usuarios.model.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Lógica de negocio para el módulo de pacientes.
 */

/**
 * Actualiza la obra social de un paciente.
 * @param {number} id_paciente
 * @param {number} id_obra_social
 */
export const actualizarObraSocial = async (id_paciente, id_obra_social) => {
  // 1. Validar que la obra social exista
  const obraSocial = await usuariosModel.findObraSocialById(id_obra_social);
  if (!obraSocial) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'La obra social especificada no existe');
  }

  // 2. Validar que el paciente exista
  const paciente = await pacientesModel.findById(id_paciente);
  if (!paciente) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El paciente no existe');
  }

  // 3. Actualizar
  await pacientesModel.updateObraSocial(id_paciente, id_obra_social);
};
