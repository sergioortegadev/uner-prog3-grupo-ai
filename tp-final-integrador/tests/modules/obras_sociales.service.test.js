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
    it('debería retornar las obras sociales del modelo con total', async () => {
      // Configuramos el mock para que devuelva el objeto con data y total
      const mockResult = {
        data: [{ id: 1, nombre: 'OSDE' }],
        total: 1,
      };
      obrasSocialesModel.findAllActive.mockResolvedValue(mockResult);

      const params = { limit: 10, offset: 0 };
      const result = await obrasSocialesService.getAllActive(params);

      // Verificamos que se llamó al modelo con los parámetros y que el resultado coincide
      expect(obrasSocialesModel.findAllActive).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResult);
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
