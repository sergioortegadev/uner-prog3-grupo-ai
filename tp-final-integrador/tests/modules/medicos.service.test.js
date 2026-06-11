import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as medicosService from '../../src/services/medicos.service.js';
import * as medicosModel from '../../src/database/medicos.js';
import * as obrasSocialesModel from '../../src/database/obras_sociales.js';
import * as especialidadesModel from '../../src/database/especialidades.js';

vi.mock('../../src/database/medicos.js', () => ({
  findById: vi.fn(),
  getObrasSocialesIds: vi.fn(),
  assignObrasSociales: vi.fn(),
  updateEspecialidad: vi.fn(),
  findByEspecialidad: vi.fn(),
  findAll: vi.fn(),
}));

vi.mock('../../src/database/obras_sociales.js', () => ({
  findByIds: vi.fn(),
}));

vi.mock('../../src/database/especialidades.js', () => ({
  findById: vi.fn(),
}));

const MOCK_MEDICO = { id: 1, matricula: 1000, apellido: 'Gomez', nombres: 'Juan' };

describe('Médicos - Unit Tests (Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerTodos()', () => {
    it('debería retornar el listado de médicos', async () => {
      const mockList = [{ id: 1 }, { id: 2 }];
      medicosModel.findAll.mockResolvedValue(mockList);

      const result = await medicosService.obtenerTodos();

      expect(result.message).toBe('Listado de médicos obtenido correctamente');
      expect(result.medicos).toEqual(mockList);
      expect(medicosModel.findAll).toHaveBeenCalled();
    });
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

  describe('updateEspecialidad()', () => {
    const MOCK_MEDICO_ACTIVO = { id_medico: 1, activo: 1 };
    const MOCK_MEDICO_INACTIVO = { id_medico: 1, activo: 0 };
    const MOCK_ESPECIALIDAD_ACTIVA = { id_especialidad: 2, activo: 1 };
    const MOCK_ESPECIALIDAD_INACTIVA = { id_especialidad: 2, activo: 0 };

    it('debería lanzar NOT_FOUND si el médico no existe', async () => {
      medicosModel.findById.mockResolvedValue(null);

      await expect(medicosService.updateEspecialidad(1, 2)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
        message: 'Médico con ID 1 no encontrado',
      });
    });

    it('debería lanzar VALIDATION_ERROR si el médico está inactivo', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO_INACTIVO);

      await expect(medicosService.updateEspecialidad(1, 2)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        status: 422,
        message: 'El médico con ID 1 está inactivo',
      });
    });

    it('debería lanzar NOT_FOUND si la especialidad no existe', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO_ACTIVO);
      especialidadesModel.findById.mockResolvedValue(null);

      await expect(medicosService.updateEspecialidad(1, 2)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
        message: 'Especialidad con ID 2 no encontrada',
      });
    });

    it('debería lanzar VALIDATION_ERROR si la especialidad está inactiva', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO_ACTIVO);
      especialidadesModel.findById.mockResolvedValue(MOCK_ESPECIALIDAD_INACTIVA);

      await expect(medicosService.updateEspecialidad(1, 2)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        status: 422,
        message: 'La especialidad con ID 2 está inactiva',
      });
    });

    it('debería actualizar la especialidad correctamente', async () => {
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO_ACTIVO);
      especialidadesModel.findById.mockResolvedValue(MOCK_ESPECIALIDAD_ACTIVA);
      medicosModel.updateEspecialidad.mockResolvedValue(true);

      const result = await medicosService.updateEspecialidad(1, 2);

      expect(medicosModel.updateEspecialidad).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual({
        idMedico: 1,
        idEspecialidad: 2,
      });
    });

    it('no debería llamar a updateEspecialidad si el médico ya tiene esa especialidad asignada', async () => {
      const MOCK_MEDICO_CON_MISMA_ESP = { id_medico: 1, activo: 1, idEspecialidad: 2 };
      medicosModel.findById.mockResolvedValue(MOCK_MEDICO_CON_MISMA_ESP);
      especialidadesModel.findById.mockResolvedValue(MOCK_ESPECIALIDAD_ACTIVA);

      const result = await medicosService.updateEspecialidad(1, 2);

      expect(medicosModel.updateEspecialidad).not.toHaveBeenCalled();
      expect(result).toEqual({
        idMedico: 1,
        idEspecialidad: 2,
      });
    });
  });

  describe('obtenerPorEspecialidad()', () => {
    it('debería retornar los médicos de la especialidad indicada', async () => {
      const medicos = [
        { idMedico: 1, idEspecialidad: 2 },
        { idMedico: 3, idEspecialidad: 2 },
      ];
      especialidadesModel.findById.mockResolvedValue({ id: 2, activo: true });
      medicosModel.findByEspecialidad.mockResolvedValue(medicos);

      const result = await medicosService.obtenerPorEspecialidad(2);

      expect(especialidadesModel.findById).toHaveBeenCalledWith(2, false);
      expect(medicosModel.findByEspecialidad).toHaveBeenCalledWith(2);
      expect(result).toEqual(medicos);
    });

    it('debería retornar una lista vacía si la especialidad no tiene médicos', async () => {
      especialidadesModel.findById.mockResolvedValue({ id: 2, activo: true });
      medicosModel.findByEspecialidad.mockResolvedValue([]);

      const result = await medicosService.obtenerPorEspecialidad(2);

      expect(result).toEqual([]);
    });

    it('debería lanzar NOT_FOUND si la especialidad no existe', async () => {
      especialidadesModel.findById.mockResolvedValue(null);

      await expect(medicosService.obtenerPorEspecialidad(2)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
        message: 'Especialidad con ID 2 no encontrada',
      });

      expect(medicosModel.findByEspecialidad).not.toHaveBeenCalled();
    });

    it('debería lanzar VALIDATION_ERROR si la especialidad está inactiva', async () => {
      especialidadesModel.findById.mockResolvedValue({ id: 2, activo: false });

      await expect(medicosService.obtenerPorEspecialidad(2)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        status: 422,
        message: 'La especialidad con ID 2 está inactiva',
      });

      expect(medicosModel.findByEspecialidad).not.toHaveBeenCalled();
    });
  });
});
