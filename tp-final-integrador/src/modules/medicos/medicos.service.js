import * as medicosModel from './medicos.model.js';
import * as usuariosModel from '../usuarios/usuarios.model.js';
import { AppError, ERROR_CODES } from '../../helpers/errors.helper.js';

/**
 * Lógica de negocio para el módulo de médicos.
 */

/**
 * Obtiene el listado de médicos.
 * @param {number|null} id_especialidad
 */
export const listarMedicos = async (id_especialidad = null) => {
  return await medicosModel.findAll(id_especialidad);
};

/**
 * Actualiza la especialidad de un médico.
 * @param {number} id_medico
 * @param {number} id_especialidad
 */
export const actualizarEspecialidad = async (id_medico, id_especialidad) => {
  // 1. Validar que la especialidad exista
  const especialidad = await usuariosModel.findEspecialidadById(id_especialidad);
  if (!especialidad) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'La especialidad especificada no existe');
  }

  // 2. Validar que el médico exista
  const medico = await medicosModel.findById(id_medico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El médico no existe');
  }

  // 3. Actualizar
  await medicosModel.updateEspecialidad(id_medico, id_especialidad);
};

/**
 * Asocia una obra social a un médico.
 * @param {number} id_medico
 * @param {number} id_obra_social
 */
export const asociarObraSocial = async (id_medico, id_obra_social) => {
  // 1. Validar que la obra social exista
  const obraSocial = await usuariosModel.findObraSocialById(id_obra_social);
  if (!obraSocial) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'La obra social especificada no existe');
  }

  // 2. Validar que el médico exista
  const medico = await medicosModel.findById(id_medico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El médico no existe');
  }

  // 3. Verificar si ya existe la asociación
  const asociacion = await medicosModel.findObraSocialAsociada(id_medico, id_obra_social);

  if (asociacion && asociacion.activo === 1) {
    throw new AppError(
      ERROR_CODES.DUPLICATE_ENTRY,
      'La obra social ya está asociada a este médico',
    );
  }

  // 4. Crear o reactivar
  await medicosModel.addObraSocial(id_medico, id_obra_social, asociacion?.id_medico_obra_social);
};

/**
 * Desvincula una obra social de un médico.
 * @param {number} id_medico
 * @param {number} id_obra_social
 */
export const desvincularObraSocial = async (id_medico, id_obra_social) => {
  // Solo se necesita validar existencia de médico para un mejor manejo de errores
  const medico = await medicosModel.findById(id_medico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'El médico no existe');
  }

  const affectedRows = await medicosModel.removeObraSocial(id_medico, id_obra_social);
  if (affectedRows === 0) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      'La asociación no existe o ya se encuentra desvinculada',
    );
  }
};
