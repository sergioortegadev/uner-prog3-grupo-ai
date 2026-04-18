import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as medicosService from '../../src/modules/medicos/medicos.service.js';
import * as medicosModel from '../../src/modules/medicos/medicos.model.js';
import * as usuariosModel from '../../src/modules/usuarios/usuarios.model.js';

vi.mock('../../src/modules/medicos/medicos.model.js');
vi.mock('../../src/modules/usuarios/usuarios.model.js');

describe('Medicos Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarMedicos', () => {
    it('debe retornar la lista de médicos del modelo', async () => {
      const mockMedicos = [{ id_medico: 1, apellido: 'Test' }];
      medicosModel.findAll.mockResolvedValue(mockMedicos);

      const result = await medicosService.listarMedicos();
      expect(result).toEqual(mockMedicos);
      expect(medicosModel.findAll).toHaveBeenCalledWith(null);
    });
  });

  describe('actualizarEspecialidad', () => {
    it('debe lanzar error si la especialidad no existe', async () => {
      usuariosModel.findEspecialidadById.mockResolvedValue(null);
      await expect(medicosService.actualizarEspecialidad(1, 99)).rejects.toMatchObject({
        status: 422,
        message: 'La especialidad especificada no existe',
      });
    });

    it('debe lanzar error si el médico no existe', async () => {
      usuariosModel.findEspecialidadById.mockResolvedValue({ id_especialidad: 1 });
      medicosModel.findById.mockResolvedValue(null);

      await expect(medicosService.actualizarEspecialidad(99, 1)).rejects.toMatchObject({
        status: 404,
        message: 'El médico no existe',
      });
    });

    it('debe llamar al modelo para actualizar si todo es correcto', async () => {
      usuariosModel.findEspecialidadById.mockResolvedValue({ id_especialidad: 2 });
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });

      await medicosService.actualizarEspecialidad(1, 2);
      expect(medicosModel.updateEspecialidad).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('asociarObraSocial', () => {
    it('debe lanzar error 422 si la obra social no existe', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue(null);

      await expect(medicosService.asociarObraSocial(1, 99)).rejects.toMatchObject({
        status: 422,
        message: 'La obra social especificada no existe',
      });
    });

    it('debe lanzar error si el médico no existe', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 1 });
      medicosModel.findById.mockResolvedValue(null);

      await expect(medicosService.asociarObraSocial(99, 1)).rejects.toMatchObject({
        status: 404,
        message: 'El médico no existe',
      });
    });

    it('debe lanzar error 409 si la asociación ya está activa', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 1 });
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });
      medicosModel.findObraSocialAsociada.mockResolvedValue({ activo: 1 });

      await expect(medicosService.asociarObraSocial(1, 1)).rejects.toMatchObject({
        status: 409,
        message: 'La obra social ya está asociada a este médico',
      });
    });

    it('debe reactivar asociación si existe pero está inactiva', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 1 });
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });
      medicosModel.findObraSocialAsociada.mockResolvedValue({
        id_medico_obra_social: 10,
        activo: 0,
      });

      await medicosService.asociarObraSocial(1, 1);
      expect(medicosModel.addObraSocial).toHaveBeenCalledWith(1, 1, 10);
    });

    it('debe crear nueva asociación si no existe previa', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 1 });
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });
      medicosModel.findObraSocialAsociada.mockResolvedValue(null);

      await medicosService.asociarObraSocial(1, 1);
      expect(medicosModel.addObraSocial).toHaveBeenCalledWith(1, 1, undefined);
    });
  });

  describe('desvincularObraSocial', () => {
    it('debe lanzar error 404 si el médico no existe al desvincular', async () => {
      medicosModel.findById.mockResolvedValue(null);

      await expect(medicosService.desvincularObraSocial(99, 1)).rejects.toMatchObject({
        status: 404,
        message: 'El médico no existe',
      });
    });

    it('debe llamar al modelo para desvincular si el médico existe', async () => {
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });
      medicosModel.removeObraSocial.mockResolvedValue(1);

      await medicosService.desvincularObraSocial(1, 1);
      expect(medicosModel.removeObraSocial).toHaveBeenCalledWith(1, 1);
    });

    it('debe lanzar error 404 si la asociación no existe o ya está inactiva', async () => {
      medicosModel.findById.mockResolvedValue({ id_medico: 1 });
      medicosModel.removeObraSocial.mockResolvedValue(0);

      await expect(medicosService.desvincularObraSocial(1, 1)).rejects.toMatchObject({
        status: 404,
        message: 'La asociación no existe o ya se encuentra desvinculada',
      });
    });
  });
});
