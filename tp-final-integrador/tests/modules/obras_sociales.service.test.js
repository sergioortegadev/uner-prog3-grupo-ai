import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as obrasSocialesService from '../../src/modules/obras_sociales/obras_sociales.service.js';
import * as obrasSocialesModel from '../../src/modules/obras_sociales/obras_sociales.model.js';

// Mockeamos el modelo por completo
vi.mock('../../src/modules/obras_sociales/obras_sociales.model.js', () => ({
  findAllActive: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));

describe('Obras Sociales - Unit Tests (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reseteamos los mocks antes de cada test
  });

  describe('getAllActive()', () => {
    it('debería retornar las obras sociales del modelo', async () => {
      // Configuramos el mock para que devuelva un valor falso
      const mockData = [{ id: 1, nombre: 'OSDE' }];
      obrasSocialesModel.findAllActive.mockResolvedValue(mockData);

      const result = await obrasSocialesService.getAllActive();

      // Verificamos que se llamó al modelo y que el resultado coincide
      expect(obrasSocialesModel.findAllActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('createObraSocial()', () => {
    it('debería delegar la creación al modelo con los datos correctos', async () => {
      const nuevaObra = { nombre: 'Swiss' };
      obrasSocialesModel.create.mockResolvedValue({ id: 99, ...nuevaObra });

      const result = await obrasSocialesService.createObraSocial(nuevaObra);

      expect(obrasSocialesModel.create).toHaveBeenCalledWith(nuevaObra);
      expect(result.id).toBe(99);
    });
  });

  describe('getObraSocialById()', () => {
    it('debería retornar nulo si el modelo no encuentra nada', async () => {
      obrasSocialesModel.findById.mockResolvedValue(null);

      const result = await obrasSocialesService.getObraSocialById(123);

      expect(obrasSocialesModel.findById).toHaveBeenCalledWith(123);
      expect(result).toBeNull();
    });
  });
});
