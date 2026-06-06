import * as especialidadesModel from '../database/especialidades.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

// Lógica de negocio para Especialidades

export const getAll = async (params) => {
    return await especialidadesModel.findAll(params);
};

export const getById = async (id) => {
    return await especialidadesModel.findById(id);
}

export const createEspecialidad = async (data) => {
    const existing = await especialidadesModel.findByName(data.nombre);
    if (existing) {
        const message = existing.activo === 0
            ? `Ya existe la especialidad '${data.nombre}' pero se encuentra inactiva. Debería reactivarla.`
            : 'Ya existe una especialidad con ese nombre'; 
        throw new AppError(ERROR_CODES.DUPLICATE_ENTRY, message);
    }
    return await especialidadesModel.create(data);
};

export const updateEspecialidad = async (id, data) => {
    const current = await especialidadesModel.findById(id, false); 
    if (!current) return false;
    return await especialidadesModel.update(id, data);
};

export const deleteEspecialidad = async (id) => {
    const current = await especialidadesModel.findById(id, true);
    if (!current) return false;
    return await especialidadesModel.softDelete(id); 
}