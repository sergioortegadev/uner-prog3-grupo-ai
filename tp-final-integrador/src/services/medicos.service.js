import * as medicosModel from '../database/medicos.js';
import * as obrasSocialesModel from '../database/obras_sociales.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Asocia un médico con una lista de obras sociales.
 * @param {number} idMedico
 * @param {number[]} idsObrasSociales
 */
export const asociarObrasSociales = async (idMedico, idsObrasSociales) => {
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

  // 3. Filtrar las que ya están asociadas (opcional por INSERT IGNORE, pero útil para lógica de negocio)
  const actuales = await medicosModel.getObrasSocialesIds(idMedico);
  const nuevas = uniqueIds.filter((id) => !actuales.includes(id));

  if (nuevas.length === 0) {
    return { message: 'El médico ya tiene todas las obras sociales indicadas asociadas' };
  }

  // 4. Ejecutar la asociación
  await medicosModel.assignObrasSociales(idMedico, nuevas);

  return { message: 'Obras sociales asociadas correctamente', nuevasAsociaciones: nuevas.length };
};
