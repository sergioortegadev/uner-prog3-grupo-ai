import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as obrasSocialesService from '../../src/services/obras_sociales.service.ts';
import * as obrasSocialesModel from '../../src/database/obras_sociales.ts';

// Mockeamos el modelo por completo
vi.mock('../../src/database/obras_sociales.js', () => ({
  findAll: vi.fn(),
  findByName: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

describe('Obras Sociales - Unit Tests (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reseteamos los mocks antes de cada test
  });

  describe('getAll()', () => {
    it('debería retornar las obras sociales del modelo con total', async () => {
      // Configuramos el mock para que devuelva el objeto con data y total
      const mockResult = {
        data: [{ id: 1, nombre: 'OSDE' }],
        total: 1,
      };
      obrasSocialesModel.findAll.mockResolvedValue(mockResult);

      const params = { limit: 10, offset: 0 };
      const result = await obrasSocialesService.getAll(params);

      // Verificamos que se llamó al modelo con los parámetros y que el resultado coincide
      expect(obrasSocialesModel.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
    });

    it('debería pasar el parámetro "active" al modelo', async () => {
      const mockResult = { data: [], total: 0 };
      obrasSocialesModel.findAll.mockResolvedValue(mockResult);

      const params = { active: 0 };
      await obrasSocialesService.getAll(params);

      expect(obrasSocialesModel.findAll).toHaveBeenCalledWith(params);
    });
  });

  describe('createObraSocial()', () => {
    it('debería delegar la creación al modelo con los datos correctos', async () => {
      const nuevaObra = { nombre: 'Swiss' };
      // Mockeamos que no existe una obra social con ese nombre
      obrasSocialesModel.findByName.mockResolvedValue(null);
      obrasSocialesModel.create.mockResolvedValue({ id: 99, ...nuevaObra });

      const result = await obrasSocialesService.createObraSocial(nuevaObra);

      // Verificamos que se haya consultado por el nombre
      expect(obrasSocialesModel.findByName).toHaveBeenCalledWith(nuevaObra.nombre);
      expect(obrasSocialesModel.create).toHaveBeenCalledWith(nuevaObra);
      expect(result.id).toBe(99);
    });

    it('debería lanzar error si ya existe una obra social con ese nombre', async () => {
      const nuevaObra = { nombre: 'Swiss' };
      // Mockeamos que YA existe una obra social con ese nombre
      obrasSocialesModel.findByName.mockResolvedValue({ id: 1, nombre: 'Swiss' });

      await expect(obrasSocialesService.createObraSocial(nuevaObra)).rejects.toThrow(
        'Ya existe una obra social con ese nombre',
      );

      // Verificamos que NO se haya llamado al create
      expect(obrasSocialesModel.create).not.toHaveBeenCalled();
    });

    it('debería lanzar error con sugerencia de reactivación si la obra social existe pero está inactiva', async () => {
      const nuevaObra = { nombre: 'Swiss Inactiva' };
      obrasSocialesModel.findByName.mockResolvedValue({
        id: 2,
        nombre: 'Swiss Inactiva',
        activo: 0,
      });

      await expect(obrasSocialesService.createObraSocial(nuevaObra)).rejects.toThrow(
        "Ya existe la obra social 'Swiss Inactiva' pero se encuentra inactiva. Debería reactivarla.",
      );

      expect(obrasSocialesModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getObraSocialById()', () => {
    it('debería retornar nulo si el modelo no encuentra nada', async () => {
      obrasSocialesModel.findById.mockResolvedValue(null);

      const result = await obrasSocialesService.getObraSocialById(123);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(123, true);
      expect(result).toBeNull();
    });

    it('debería retornar la obra social si el modelo la encuentra', async () => {
      const mockObra = { id: 1, nombre: 'OSDE', activo: 1 };
      obrasSocialesModel.findById.mockResolvedValue(mockObra);

      const result = await obrasSocialesService.getObraSocialById(1);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(mockObra);
    });

    it('debería respetar el parámetro onlyActive cuando se pasa explicitamente', async () => {
      await obrasSocialesService.getObraSocialById(1, false);
      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(1, false);
    });
  });

  describe('updateObraSocial()', () => {
    it('debería actualizar correctamente si la obra social existe y el nombre no se repite', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'Vieja', activo: 1 };
      const updateData = { nombre: 'Nueva' };

      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      obrasSocialesModel.findByName.mockResolvedValue(null);
      obrasSocialesModel.update.mockResolvedValue(true);

      const result = await obrasSocialesService.updateObraSocial(id, updateData);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(id, false);
      expect(obrasSocialesModel.findByName).toHaveBeenCalledWith(updateData.nombre);
      expect(obrasSocialesModel.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBe(true);
    });

    it('debería retornar false si la obra social no existe', async () => {
      obrasSocialesModel.findById.mockResolvedValue(null);

      const result = await obrasSocialesService.updateObraSocial(123, { nombre: 'Cambio' });

      expect(result).toBe(false);
      expect(obrasSocialesModel.update).not.toHaveBeenCalled();
    });

    it('debería permitir actualizar una obra social inactiva (reactivación)', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'Inactiva', activo: 0 };
      const updateData = { activo: 1 };

      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      obrasSocialesModel.update.mockResolvedValue(true);

      const result = await obrasSocialesService.updateObraSocial(id, updateData);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(id, false);
      expect(obrasSocialesModel.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBe(true);
    });

    it('debería manejar la condición de carrera si el nombre se duplica entre el chequeo y la actualización', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'Original', activo: 1 };
      const updateData = { nombre: 'Nuevo' };

      // 1. Pasa el chequeo de existencia
      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      // 2. Pasa el chequeo de nombre duplicado (en ese instante no hay otro)
      obrasSocialesModel.findByName.mockResolvedValue(null);

      // 3. Al intentar actualizar, falla porque otro proceso insertó el mismo nombre justo antes (Race Condition)
      const dbError = new Error("Duplicate entry 'Nuevo' for key 'nombre'");
      dbError.code = 'ER_DUP_ENTRY';
      obrasSocialesModel.update.mockRejectedValue(dbError);

      await expect(obrasSocialesService.updateObraSocial(id, updateData)).rejects.toThrow(
        'Duplicate entry',
      );
    });

    it('debería lanzar error si el nombre nuevo ya existe en otra obra social', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'Original', activo: 1 };
      const updateData = { nombre: 'Repetido' };

      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      obrasSocialesModel.findByName.mockResolvedValue({ id: 2, nombre: 'Repetido', activo: 1 });

      await expect(obrasSocialesService.updateObraSocial(id, updateData)).rejects.toThrow(
        'Ya existe otra obra social con ese nombre',
      );

      expect(obrasSocialesModel.update).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el nombre nuevo ya existe pero está inactivo en otra obra social', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'Original', activo: 1 };
      const updateData = { nombre: 'Inactivo' };

      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      obrasSocialesModel.findByName.mockResolvedValue({ id: 2, nombre: 'Inactivo', activo: 0 });

      await expect(obrasSocialesService.updateObraSocial(id, updateData)).rejects.toThrow(
        "Ya existe la obra social 'Inactivo' pero se encuentra inactiva. No puede usar este nombre.",
      );

      expect(obrasSocialesModel.update).not.toHaveBeenCalled();
    });

    it('debería permitir actualizar si el nombre es el mismo que el actual (case-insensitive)', async () => {
      const id = 1;
      const currentObra = { id: 1, nombre: 'OSDE', activo: 1 };
      const updateData = { nombre: 'osde', descripcion: 'Nueva desc' };

      obrasSocialesModel.findById.mockResolvedValue(currentObra);
      obrasSocialesModel.update.mockResolvedValue(true);

      const result = await obrasSocialesService.updateObraSocial(id, updateData);

      expect(obrasSocialesModel.findByName).not.toHaveBeenCalled();
      expect(obrasSocialesModel.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toBe(true);
    });
  });

  describe('removeObraSocial()', () => {
    it('debería delegar el borrado lógico al modelo si existe y está activa', async () => {
      obrasSocialesModel.findById.mockResolvedValue({ id: 1, activo: 1 });
      obrasSocialesModel.softDelete.mockResolvedValue(true);

      const result = await obrasSocialesService.removeObraSocial(1);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(1, true);
      expect(obrasSocialesModel.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('debería retornar false si la obra social no existe o ya está inactiva', async () => {
      obrasSocialesModel.findById.mockResolvedValue(null);

      const result = await obrasSocialesService.removeObraSocial(123);

      expect(result).toBe(false);
      expect(obrasSocialesModel.softDelete).not.toHaveBeenCalled();
    });
  });
});
