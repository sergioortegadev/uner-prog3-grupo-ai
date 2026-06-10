import * as medicosModel from '../database/medicos.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import * as especialidadesModel from '../database/especialidades.js';
import { findActiveOrThrow } from '../helpers/entity.helper.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Asocia un médico con una lista de obras sociales.
 * @param {number} idMedico
 * @param {number[]} idsObrasSociales
 */
export const assignObrasSociales = async (idMedico, idsObrasSociales) => {
  const medico = await medicosModel.findById(idMedico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, `Médico con ID ${idMedico} no encontrado`);
  }

  const uniqueIds = [...new Set(idsObrasSociales)];
  const encontradas = await obrasSocialesModel.findByIds(uniqueIds);

  if (encontradas.length !== uniqueIds.length) {
    const encontradasIds = encontradas.map((os) => os.id);
    const faltantes = uniqueIds.filter((id) => !encontradasIds.includes(id));
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Las siguientes Obras Sociales no existen o están inactivas: ${faltantes.join(', ')}`,
    );
  }

  const actuales = await medicosModel.getObrasSocialesIds(idMedico);
  const nuevas = uniqueIds.filter((id) => !actuales.includes(id));
  const yaExistentes = uniqueIds.filter((id) => actuales.includes(id));

  if (nuevas.length === 0) {
    return {
      message: 'El médico ya tiene todas las obras sociales indicadas asociadas',
      asociadas: [],
      yaExistentes,
    };
  }

  await medicosModel.assignObrasSociales(idMedico, nuevas);

  return {
    message: 'Obras sociales asociadas correctamente',
    asociadas: nuevas,
    yaExistentes,
  };
};

/**
 * Obtiene el listado de todos los médicos activos.
 * @returns {Promise<Object>}
 */
export const obtenerTodos = async () => {
  const medicos = await medicosModel.findAll();

  return {
    message: 'Listado de médicos obtenido correctamente',
    medicos,
  };
};

export const obtenerPorEspecialidad = async (idEspecialidad) => {
  await findActiveOrThrow((id) => especialidadesModel.findById(id, false), idEspecialidad, {
    notFoundMessage: `Especialidad con ID ${idEspecialidad} no encontrada`,
    inactiveMessage: `La especialidad con ID ${idEspecialidad} está inactiva`,
  });

  const medicos = await medicosModel.findByEspecialidad(idEspecialidad);

  return {
    message: 'Listado de médicos obtenido correctamente',
    medicos,
  };
};

/* Actualiza la especialidad de un médico.
 * @param {number} idMedico
 * @param {number} idEspecialidad
 * @returns {Promise<Object>}
 */
export const updateEspecialidad = async (idMedico, idEspecialidad) => {
  const medico = await findActiveOrThrow(medicosModel.findById, idMedico, {
    notFoundMessage: `Médico con ID ${idMedico} no encontrado`,
    inactiveMessage: `El médico con ID ${idMedico} está inactivo`,
  });

  await findActiveOrThrow((id) => especialidadesModel.findById(id, false), idEspecialidad, {
    notFoundMessage: `Especialidad con ID ${idEspecialidad} no encontrada`,
    inactiveMessage: `La especialidad con ID ${idEspecialidad} está inactiva`,
  });

  if (medico.idEspecialidad !== idEspecialidad) {
    await medicosModel.updateEspecialidad(idMedico, idEspecialidad);
  }

  return {
    idMedico,
    idEspecialidad,
  };
};
