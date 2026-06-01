import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turnosService from '../../src/services/turnos.service.js';
import * as turnosModel from '../../src/database/turnos.js';
import * as medicosModel from '../../src/database/medicos.js';
import * as pacientesModel from '../../src/database/pacientes.js';
import * as obrasSocialesModel from '../../src/database/obras_sociales.js';

vi.mock('../../src/database/turnos.js', () => ({
  create: vi.fn(),
  checkPatientOverlap: vi.fn(),
  existsByMedicoAndFechaHora: vi.fn(),
}));

vi.mock('../../src/database/medicos.js', () => ({
  findById: vi.fn(),
  acceptsObraSocial: vi.fn(),
}));

vi.mock('../../src/database/pacientes.js', () => ({
  findById: vi.fn(),
}));

vi.mock('../../src/database/obras_sociales.js', () => ({
  findById: vi.fn(),
}));

describe('Turnos Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    medicosModel.acceptsObraSocial.mockResolvedValue(true);
    turnosModel.checkPatientOverlap.mockResolvedValue(false);
    turnosModel.existsByMedicoAndFechaHora.mockResolvedValue(false);
  });

  describe('registrarTurno() - Calculation Logic', () => {
    it('debería calcular el valorTotal correctamente para una obra social con descuento (esParticular = false)', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const mockMedico = { idMedico: 1, valorConsulta: 5000, activo: true };
      const mockPaciente = { idPaciente: 1, idObraSocial: 1, activo: true };
      const mockObraSocial = { id: 1, porcentajeDescuento: 0.1, esParticular: false, activo: true };

      medicosModel.findById.mockResolvedValue(mockMedico);
      pacientesModel.findById.mockResolvedValue(mockPaciente);
      obrasSocialesModel.findById.mockResolvedValue(mockObraSocial);
      turnosModel.create.mockResolvedValue(100);

      const result = await turnosService.registrarTurno(data);

      expect(turnosModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          valorTotal: 4500, // 5000 - (10% of 5000)
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          idTurno: 100,
          valorTotal: 4500,
        }),
      );
    });

    it('debería calcular el valorTotal correctamente para atención particular (esParticular = true)', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 2,
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const mockMedico = { idMedico: 1, valorConsulta: 5000, activo: true };
      const mockPaciente = { idPaciente: 1, idObraSocial: 2, activo: true };
      const mockObraSocial = { id: 2, porcentajeDescuento: 0.1, esParticular: true, activo: true };

      medicosModel.findById.mockResolvedValue(mockMedico);
      pacientesModel.findById.mockResolvedValue(mockPaciente);
      obrasSocialesModel.findById.mockResolvedValue(mockObraSocial);
      turnosModel.create.mockResolvedValue(101);

      const result = await turnosService.registrarTurno(data);

      expect(turnosModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          valorTotal: 5000, // Particular, no discount
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          idTurno: 101,
          valorTotal: 5000,
        }),
      );
    });
  });

  describe('registrarTurno() - Validations', () => {
    it('debería lanzar error si el médico no existe', async () => {
      medicosModel.findById.mockResolvedValue(null);

      await expect(turnosService.registrarTurno({ idMedico: 999 })).rejects.toThrow(
        'El médico solicitado no existe',
      );
    });

    it('debería lanzar error si el médico no está activo', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: false });

      await expect(turnosService.registrarTurno({ idMedico: 1 })).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'El médico solicitado no se encuentra activo',
      });
    });

    it('debería lanzar error si el paciente no existe', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue(null);

      await expect(turnosService.registrarTurno({ idMedico: 1, idPaciente: 999 })).rejects.toThrow(
        'El paciente solicitado no existe',
      );
    });

    it('debería lanzar error si la obra social no existe', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 999, activo: true });
      obrasSocialesModel.findById.mockResolvedValue(null);

      await expect(
        turnosService.registrarTurno({ idMedico: 1, idPaciente: 1, idObraSocial: 999 }),
      ).rejects.toThrow('La obra social solicitada no existe');
    });

    it('debería lanzar error si la obra social no está activa', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({ id: 1, activo: false });

      await expect(
        turnosService.registrarTurno({ idMedico: 1, idPaciente: 1, idObraSocial: 1 }),
      ).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'La obra social solicitada no se encuentra activa',
      });
    });

    it('debería lanzar error si el médico no trabaja con la obra social especificada', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({ id: 1, activo: true, esParticular: false });
      medicosModel.acceptsObraSocial.mockResolvedValue(false);

      await expect(
        turnosService.registrarTurno({ idMedico: 1, idPaciente: 1, idObraSocial: 1 }),
      ).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'El médico solicitado no trabaja con la obra social especificada',
      });
    });

    it('debería permitir registrar el turno si el médico trabaja con la obra social', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };
      medicosModel.findById.mockResolvedValue({ idMedico: 1, valorConsulta: 5000, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({
        id: 1,
        porcentajeDescuento: 0.1,
        esParticular: false,
        activo: true,
      });
      medicosModel.acceptsObraSocial.mockResolvedValue(true);
      turnosModel.create.mockResolvedValue(100);

      const result = await turnosService.registrarTurno(data);

      expect(medicosModel.acceptsObraSocial).toHaveBeenCalledWith(1, 1);
      expect(result.idTurno).toBe(100);
    });

    it('debería omitir la validación de medicos_obras_sociales si la obra social es particular', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };
      medicosModel.findById.mockResolvedValue({ idMedico: 1, valorConsulta: 5000, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({
        id: 1,
        porcentajeDescuento: 0,
        esParticular: true,
        activo: true,
      });
      turnosModel.create.mockResolvedValue(100);

      const result = await turnosService.registrarTurno(data);

      expect(medicosModel.acceptsObraSocial).not.toHaveBeenCalled();
      expect(result.idTurno).toBe(100);
    });

    it('debería lanzar error si el paciente ya tiene un turno reservado para la misma fecha y hora', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 1,
        idObraSocial: 1,
        fecha: '2026-07-15',
        hora: '14:30',
      };
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({ id: 1, activo: true, esParticular: false });
      turnosModel.checkPatientOverlap.mockResolvedValue(true);

      await expect(turnosService.registrarTurno(data)).rejects.toThrow(
        'El paciente ya tiene un turno reservado para la misma fecha y hora',
      );
    });
  });
});
