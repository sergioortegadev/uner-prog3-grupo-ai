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
  // 1. Validar que el médico exista
  const medico = await medicosModel.findById(idMedico);
  if (!medico) {
    throw new AppError(ERROR_CODES.NOT_FOUND, `Médico con ID ${idMedico} no encontrado`);
  }

  // 2. Validar que todas las obras sociales existan y estén activas
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

  // 3. Filtrar las que ya están asociadas
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

  // 4. Ejecutar la asociación
  await medicosModel.assignObrasSociales(idMedico, nuevas);

  return {
    message: 'Obras sociales asociadas correctamente',
    asociadas: nuevas,
    yaExistentes,
  };
};

/**
 * Actualiza la especialidad de un médico.
 * @param {number} idMedico
 * @param {number} idEspecialidad
 * @returns {Promise<Object>}
 */
export const updateEspecialidad = async (idMedico, idEspecialidad) => {
  // 1. Validar que el médico exista y esté activo
  const medico = await findActiveOrThrow(medicosModel.findById, idMedico, {
    notFoundMessage: `Médico con ID ${idMedico} no encontrado`,
    inactiveMessage: `El médico con ID ${idMedico} está inactivo`,
  });

  // 2. Validar que la especialidad exista y esté activa
  await findActiveOrThrow(especialidadesModel.findById, idEspecialidad, {
    notFoundMessage: `Especialidad con ID ${idEspecialidad} no encontrada`,
    inactiveMessage: `La especialidad con ID ${idEspecialidad} está inactiva`,
  });

  // 3. Actualizar solo si es una especialidad diferente
  if (medico.idEspecialidad !== idEspecialidad) {
    await medicosModel.updateEspecialidad(idMedico, idEspecialidad);
  }

  return {
    idMedico,
    idEspecialidad,
  };
};
