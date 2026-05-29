import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as especialidadesService from '../../src/services/especialidades.service.js';
import * as especialidadesModel from '../../src/database/especialidades.js';
import { ROLES } from '../../src/constants/roles.constants.js';

vi.mock('../../src/database/especialidades.js', () => ({
  findAll: vi.fn(),
  findByName: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

describe('Especialidades - Unit Tests (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll()', () => {
    it('debería retornar las especialidades del modelo con total', async () => {
      const mockResult = {
        data: [{ id: 1, nombre: 'PEDIATRÍA', activo: 1 }],
        total: 1,
      };
      especialidadesModel.findAll.mockResolvedValue(mockResult);

      const params = { limit: 10, offset: 0 };
      const result = await especialidadesService.getAll(params);

      expect(especialidadesModel.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createEspecialidad()', () => {
    it('debería delegar la creación al modelo con los datos correctos', async () => {
      const nuevaEspecialidad = { nombre: 'CARDIOLOGÍA' };
      especialidadesModel.findByName.mockResolvedValue(null);
      especialidadesModel.create.mockResolvedValue(99);

      const result = await especialidadesService.createEspecialidad(nuevaEspecialidad);

      expect(especialidadesModel.findByName).toHaveBeenCalledWith(nuevaEspecialidad.nombre);
      expect(especialidadesModel.create).toHaveBeenCalledWith(nuevaEspecialidad);
      expect(result).toBe(99);
    });

    it('debería lanzar error si ya existe una especialidad con ese nombre activa', async () => {
      const nuevaEspecialidad = { nombre: 'PEDIATRÍA' };
      especialidadesModel.findByName.mockResolvedValue({ id: 1, nombre: 'PEDIATRÍA', activo: 1 });

      await expect(especialidadesService.createEspecialidad(nuevaEspecialidad)).rejects.toThrow(
        'Ya existe una especialidad con ese nombre',
      );

      expect(especialidadesModel.create).not.toHaveBeenCalled();
    });

    it('debería lanzar un mensaje sugiriendo reactivar si existe inactiva', async () => {
      const nuevaEspecialidad = { nombre: 'PEDIATRÍA' };
      especialidadesModel.findByName.mockResolvedValue({ id: 1, nombre: 'PEDIATRÍA', activo: 0 });

      await expect(especialidadesService.createEspecialidad(nuevaEspecialidad)).rejects.toThrow(
        "Ya existe la especialidad 'PEDIATRÍA' pero se encuentra inactiva. Debería reactivarla.",
      );

      expect(especialidadesModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getEspecialidadById()', () => {
    it('debería buscar solo activos cuando no se pasa rol (default seguro)', async () => {
      const mockEspecialidad = { id: 1, nombre: 'PEDIATRÍA', activo: 1 };
      especialidadesModel.findById.mockResolvedValue(mockEspecialidad);

      const result = await especialidadesService.getEspecialidadById(1);

      expect(especialidadesModel.findById).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(mockEspecialidad);
    });

    it('debería buscar solo activos cuando el rol es Paciente', async () => {
      const mockEspecialidad = { id: 1, nombre: 'PEDIATRÍA', activo: 1 };
      especialidadesModel.findById.mockResolvedValue(mockEspecialidad);

      await especialidadesService.getEspecialidadById(1, ROLES.PACIENTE);

      expect(especialidadesModel.findById).toHaveBeenCalledWith(1, true);
    });

    it('debería buscar activos e inactivos cuando el rol es Admin', async () => {
      const mockEspecialidad = { id: 2, nombre: 'KINESIOLOGÍA', activo: 0 };
      especialidadesModel.findById.mockResolvedValue(mockEspecialidad);

      const result = await especialidadesService.getEspecialidadById(2, ROLES.ADMIN);

      expect(especialidadesModel.findById).toHaveBeenCalledWith(2, false);
      expect(result).toEqual(mockEspecialidad);
    });

    it('debería retornar null si el modelo no encuentra nada', async () => {
      especialidadesModel.findById.mockResolvedValue(null);

      const result = await especialidadesService.getEspecialidadById(123, ROLES.ADMIN);

      expect(especialidadesModel.findById).toHaveBeenCalledWith(123, false);
      expect(result).toBeNull();
    });
  });

  describe('updateEspecialidad()', () => {
    it('debería actualizar correctamente si la especialidad existe y el nombre no se repite', async () => {
      const id = 1;
      const updateData = { nombre: 'CLÍNICA' };

      especialidadesModel.findByName.mockResolvedValue(null);
      especialidadesModel.update.mockResolvedValue(true);

      const result = await especialidadesService.updateEspecialidad(id, updateData);

      expect(especialidadesModel.findByName).toHaveBeenCalledWith(updateData.nombre);
      expect(especialidadesModel.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBe(true);
    });

    it('debería retornar false si la especialidad no existe en la base de datos', async () => {
      especialidadesModel.update.mockResolvedValue(false);

      const result = await especialidadesService.updateEspecialidad(123, { nombre: 'CLÍNICA' });

      expect(result).toBe(false);
      expect(especialidadesModel.update).toHaveBeenCalledWith(123, { nombre: 'CLÍNICA' });
    });

    it('debería lanzar error si el nombre nuevo ya existe activo en otra especialidad', async () => {
      const id = 1;
      const updateData = { nombre: 'CLÍNICA' };

      especialidadesModel.findByName.mockResolvedValue({ id: 2, nombre: 'CLÍNICA', activo: 1 });

      await expect(especialidadesService.updateEspecialidad(id, updateData)).rejects.toThrow(
        'Ya existe otra especialidad con ese nombre',
      );

      expect(especialidadesModel.update).not.toHaveBeenCalled();
    });

    it('debería lanzar error indicando que está inactiva si el nombre duplicado está inactivo', async () => {
      const id = 1;
      const updateData = { nombre: 'CLÍNICA' };

      especialidadesModel.findByName.mockResolvedValue({ id: 2, nombre: 'CLÍNICA', activo: 0 });

      await expect(especialidadesService.updateEspecialidad(id, updateData)).rejects.toThrow(
        "Ya existe la especialidad 'CLÍNICA' pero se encuentra inactiva. No puede usar este nombre.",
      );

      expect(especialidadesModel.update).not.toHaveBeenCalled();
    });

    it('debería permitir actualizar si el nombre es el mismo que el actual (mismo ID)', async () => {
      const id = 1;
      const updateData = { nombre: 'PEDIATRÍA' };

      // findByName devuelve la misma especialidad (mismo ID)
      especialidadesModel.findByName.mockResolvedValue({ id: 1, nombre: 'PEDIATRÍA', activo: 1 });
      especialidadesModel.update.mockResolvedValue(true);

      const result = await especialidadesService.updateEspecialidad(id, updateData);

      expect(especialidadesModel.findByName).toHaveBeenCalledWith(updateData.nombre);
      expect(especialidadesModel.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBe(true);
    });
  });

  describe('removeEspecialidad()', () => {
    it('debería delegar el borrado lógico al modelo', async () => {
      especialidadesModel.softDelete.mockResolvedValue(true);

      const result = await especialidadesService.removeEspecialidad(1);

      expect(especialidadesModel.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('debería retornar false si la especialidad no existe o ya está inactiva en el modelo', async () => {
      especialidadesModel.softDelete.mockResolvedValue(false);

      const result = await especialidadesService.removeEspecialidad(123);

      expect(especialidadesModel.softDelete).toHaveBeenCalledWith(123);
      expect(result).toBe(false);
    });
  });
});
