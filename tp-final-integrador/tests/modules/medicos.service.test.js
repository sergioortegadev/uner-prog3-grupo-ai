import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as medicosService from '../../src/services/medicos.service.js';
import * as medicosModel from '../../src/database/medicos.js';
import * as obrasSocialesModel from '../../src/database/obras_sociales.js';

vi.mock('../../src/database/medicos.js', () => ({
  findById: vi.fn(),
  getObrasSocialesIds: vi.fn(),
  assignObrasSociales: vi.fn(),
}));

vi.mock('../../src/database/obras_sociales.js', () => ({
  findByIds: vi.fn(),
}));

const MOCK_MEDICO = { id: 1, matricula: 1000, apellido: 'Gomez', nombres: 'Juan' };

describe('Médicos - Unit Tests (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assignObrasSociales()', () => {
    it('debería lanzar NOT_FOUND si el médico no existe', async () => {
      medicosModel.findById.mockResolvedValue(null);

      await expect(medicosService.assignObrasSociales(999, [1])).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });

      expect(medicosModel.getObrasSocialesIds).not.toHaveBeenCalled();
      expect(obrasSocialesModel.findByIds).not.toHaveBeenCalled();
      expect(medicosModel.assignObrasSociales).not.toHaveBeenCalled();
    });

    it('debería lanzar VALIDATION_ERROR si alguna obra social no existe o está inactiva', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      // Solo devuelve la OS con id=1; la id=99 no existe
      obrasSocialesModel.findByIds.mockResolvedValue([{ id: 1, nombre: 'OSDE' }]);

      await expect(medicosService.assignObrasSociales(1, [1, 99])).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        status: 422,
      });

      expect(medicosModel.assignObrasSociales).not.toHaveBeenCalled();
    });

    it('debería incluir los IDs faltantes en el mensaje de error', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      obrasSocialesModel.findByIds.mockResolvedValue([]);

      await expect(medicosService.assignObrasSociales(1, [7, 8])).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        status: 422,
        message: expect.stringMatching(/7.*8|8.*7/),
      });
    });

    it('debería asociar correctamente cuando todas las OS son nuevas', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      obrasSocialesModel.findByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      medicosModel.getObrasSocialesIds.mockResolvedValue([]);
      medicosModel.assignObrasSociales.mockResolvedValue(true);

      const result = await medicosService.assignObrasSociales(1, [1, 2]);

      expect(medicosModel.assignObrasSociales).toHaveBeenCalledWith(1, [1, 2]);
      expect(result.asociadas).toEqual([1, 2]);
      expect(result.yaExistentes).toEqual([]);
    });

    it('debería retornar yaExistentes y asociadas separadas cuando hay mezcla', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      obrasSocialesModel.findByIds.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      medicosModel.getObrasSocialesIds.mockResolvedValue([1]); // OS 1 ya estaba
      medicosModel.assignObrasSociales.mockResolvedValue(true);

      const result = await medicosService.assignObrasSociales(1, [1, 2, 3]);

      expect(medicosModel.assignObrasSociales).toHaveBeenCalledWith(1, [2, 3]);
      expect(result.asociadas).toEqual([2, 3]);
      expect(result.yaExistentes).toEqual([1]);
    });

    it('debería retornar message especial y no llamar a assignObrasSociales si todas ya existen', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      obrasSocialesModel.findByIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      medicosModel.getObrasSocialesIds.mockResolvedValue([1, 2]);

      const result = await medicosService.assignObrasSociales(1, [1, 2]);

      expect(medicosModel.assignObrasSociales).not.toHaveBeenCalled();
      expect(result.asociadas).toEqual([]);
      expect(result.yaExistentes).toEqual([1, 2]);
      expect(result.message).toMatch(/ya tiene todas/i);
    });

    it('debería deduplicar IDs repetidos en el request antes de procesar', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO);
      // Con dedup: [1] → findByIds recibe [1]
      obrasSocialesModel.findByIds.mockResolvedValue([{ id: 1 }]);
      medicosModel.getObrasSocialesIds.mockResolvedValue([]);
      medicosModel.assignObrasSociales.mockResolvedValue(true);

      const result = await medicosService.assignObrasSociales(1, [1, 1, 1]);

      expect(obrasSocialesModel.findByIds).toHaveBeenCalledWith([1]);
      expect(medicosModel.assignObrasSociales).toHaveBeenCalledWith(1, [1]);
      expect(result.asociadas).toHaveLength(1);
    });
  });
});
