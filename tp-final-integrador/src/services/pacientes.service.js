import * as pacientesModel from '../database/pacientes.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Lógica de negocio para Pacientes.
 */

/**
 * Trae todos los pacientes.
 */
export const getAll = async () => {
  return await pacientesModel.findAll();
};

/**
 * Busca paciente por id_paciente.
 * @param {number} idPaciente
 */
export const getById = async (idPaciente) => {
  return await pacientesModel.findById(idPaciente);
};

/**
 * Asocia un paciente con una obra social.
 * @param {number} idPaciente
 * @param {number} idObraSocial
 */
export const assignObraSocial = async (idPaciente, idObraSocial) => {
  const paciente = await pacientesModel.findById(idPaciente);
  if (!paciente) {
    throw new AppError(ERROR_CODES.NOT_FOUND, `Paciente con ID: ${idPaciente} no encontrado`);
  }

  const obraSocialEncontrada = await obrasSocialesModel.findById(idObraSocial);

  if (!obraSocialEncontrada) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Las Obra Social no existe o está inactiva. ID: ${idObraSocial}`,
    );
  }

  if (paciente.obraSocial.id === idObraSocial) {
    return {
      message: `El paciente ya estaba asociado a la obra social con ID: ${idObraSocial}`,
    };
  }

  const pacienteActualizado = await pacientesModel.assignObraSocial(idPaciente, idObraSocial);

  if (pacienteActualizado) {
    const paciente = await pacientesModel.findById(idPaciente);
    return {
      message: 'Obra social asociada correctamente al paciente',
      paciente,
    };
  }
};
