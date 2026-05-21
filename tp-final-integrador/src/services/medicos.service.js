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
  for (const idOS of idsObrasSociales) {
    const os = await obrasSocialesModel.findById(idOS, true);
    if (!os) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        `Obra Social con ID ${idOS} no encontrada o inactiva`,
      );
    }
  }

  // 3. Filtrar las que ya están asociadas (opcional por INSERT IGNORE, pero útil para lógica de negocio)
  const actuales = await medicosModel.getObrasSocialesIds(idMedico);
  const nuevas = idsObrasSociales.filter((id) => !actuales.includes(id));

  if (nuevas.length === 0) {
    return { message: 'El médico ya tiene todas las obras sociales indicadas asociadas' };
  }

  // 4. Ejecutar la asociación
  await medicosModel.assignObrasSociales(idMedico, nuevas);

  return { message: 'Obras sociales asociadas correctamente', nuevasAsociaciones: nuevas.length };
};
