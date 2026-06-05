import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turnosService from '../../src/services/turnos.service.js';
import * as turnosModel from '../../src/database/turnos.js';
import * as medicosModel from '../../src/database/medicos.js';
import * as pacientesModel from '../../src/database/pacientes.js';
import * as obrasSocialesModel from '../../src/database/obras_sociales.js';
import { ROLES } from '../../src/constants/roles.constants.js';

vi.mock('../../src/database/turnos.js', () => ({
  create: vi.fn(),
  checkPatientOverlap: vi.fn(),
  existsByMedicoAndFechaHora: vi.fn(),
  findByMedicoId: vi.fn(),
  findByPacienteId: vi.fn(),
  findById: vi.fn(),
  updateAtendido: vi.fn(),
}));

vi.mock('../../src/database/medicos.js', () => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
  acceptsObraSocial: vi.fn(),
}));

vi.mock('../../src/database/pacientes.js', () => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
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

  describe('listarTurnosPropios()', () => {
    it('debería retornar los turnos del médico cuando el rol es MEDICO', async () => {
      const mockMedico = { idMedico: 1, activo: true };
      const mockTurnos = [{ id: 1, fecha: '2026-07-15' }];
      medicosModel.findByUserId.mockResolvedValue(mockMedico);
      turnosModel.findByMedicoId.mockResolvedValue(mockTurnos);

      const result = await turnosService.listarTurnosPropios({ id: 2, rol: ROLES.MEDICO });

      expect(medicosModel.findByUserId).toHaveBeenCalledWith(2);
      expect(turnosModel.findByMedicoId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTurnos);
    });

    it('debería lanzar NOT_FOUND si el médico no tiene perfil', async () => {
      medicosModel.findByUserId.mockResolvedValue(null);

      await expect(
        turnosService.listarTurnosPropios({ id: 99, rol: ROLES.MEDICO }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Perfil de médico no encontrado',
      });
    });

    it('debería retornar los turnos del paciente cuando el rol es PACIENTE', async () => {
      const mockPaciente = { idPaciente: 5, activo: true };
      const mockTurnos = [{ id: 2, fecha: '2026-08-10' }];
      pacientesModel.findByUserId.mockResolvedValue(mockPaciente);
      turnosModel.findByPacienteId.mockResolvedValue(mockTurnos);

      const result = await turnosService.listarTurnosPropios({ id: 3, rol: ROLES.PACIENTE });

      expect(pacientesModel.findByUserId).toHaveBeenCalledWith(3);
      expect(turnosModel.findByPacienteId).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockTurnos);
    });

    it('debería lanzar NOT_FOUND si el paciente no tiene perfil', async () => {
      pacientesModel.findByUserId.mockResolvedValue(null);

      await expect(
        turnosService.listarTurnosPropios({ id: 99, rol: ROLES.PACIENTE }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Perfil de paciente no encontrado',
      });
    });

    it('debería lanzar FORBIDDEN si el rol no es médico ni paciente', async () => {
      await expect(
        turnosService.listarTurnosPropios({ id: 1, rol: 'admin' }),
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'El rol del usuario no tiene permisos para esta acción',
      });
    });
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

      const result = await turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN });

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

      const result = await turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN });

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

  describe('registrarTurno() - Identity Resolution (PACIENTE)', () => {
    it('debería usar idPaciente e idObraSocial del perfil si el rol es PACIENTE, ignorando el payload', async () => {
      const data = {
        idMedico: 1,
        idPaciente: 999, // Ignorado
        idObraSocial: 999, // Ignorado
        fecha: '2026-07-15',
        hora: '14:30',
      };

      const mockPacientePerfil = { idPaciente: 5, idObraSocial: 2, activo: true };
      const mockMedico = { idMedico: 1, valorConsulta: 5000, activo: true };
      const mockObraSocial = { id: 2, porcentajeDescuento: 0, esParticular: true, activo: true };

      pacientesModel.findByUserId.mockResolvedValue(mockPacientePerfil);
      medicosModel.findById.mockResolvedValue(mockMedico);
      pacientesModel.findById.mockResolvedValue(mockPacientePerfil); // Llamado interno para validación de existencia
      obrasSocialesModel.findById.mockResolvedValue(mockObraSocial);
      turnosModel.create.mockResolvedValue(200);

      const result = await turnosService.registrarTurno(data, { id: 3, role: ROLES.PACIENTE });

      expect(pacientesModel.findByUserId).toHaveBeenCalledWith(3);
      expect(turnosModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          idPaciente: 5,
          idObraSocial: 2,
        }),
      );
      expect(result.idPaciente).toBe(5);
      expect(result.idObraSocial).toBe(2);
    });

    it('debería lanzar NOT_FOUND si el paciente no tiene perfil al intentar registrar un turno', async () => {
      pacientesModel.findByUserId.mockResolvedValue(null);

      await expect(
        turnosService.registrarTurno({}, { id: 3, role: ROLES.PACIENTE }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Perfil de paciente no encontrado',
      });
    });
  });

  describe('registrarTurno() - Validations', () => {
    it('debería lanzar error si el médico no existe', async () => {
      medicosModel.findById.mockResolvedValue(null);

      await expect(
        turnosService.registrarTurno({ idMedico: 999 }, { id: 1, role: ROLES.ADMIN }),
      ).rejects.toThrow('El médico solicitado no existe');
    });

    it('debería lanzar error si el médico no está activo', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: false });

      await expect(
        turnosService.registrarTurno({ idMedico: 1 }, { id: 1, role: ROLES.ADMIN }),
      ).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'El médico solicitado no se encuentra activo',
      });
    });

    it('debería lanzar error si el paciente no existe', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue(null);

      await expect(
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 999 },
          { id: 1, role: ROLES.ADMIN },
        ),
      ).rejects.toThrow('El paciente solicitado no existe');
    });

    it('debería lanzar error si el paciente no está activo', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: false });

      await expect(
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 1, idObraSocial: 1 },
          { id: 1, role: ROLES.ADMIN },
        ),
      ).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'El paciente solicitado no se encuentra activo',
      });
    });

    it('debería lanzar error si la obra social del turno no coincide con la del paciente', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });

      await expect(
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 1, idObraSocial: 2 },
          { id: 1, role: ROLES.ADMIN },
        ),
      ).rejects.toMatchObject({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'La obra social del turno no coincide con la del paciente',
      });
    });

    it('debería lanzar error si la obra social no existe', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 999, activo: true });
      obrasSocialesModel.findById.mockResolvedValue(null);

      await expect(
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 1, idObraSocial: 999 },
          { id: 1, role: ROLES.ADMIN },
        ),
      ).rejects.toThrow('La obra social solicitada no existe');
    });

    it('debería lanzar error si la obra social no está activa', async () => {
      medicosModel.findById.mockResolvedValue({ idMedico: 1, activo: true });
      pacientesModel.findById.mockResolvedValue({ idPaciente: 1, idObraSocial: 1, activo: true });
      obrasSocialesModel.findById.mockResolvedValue({ id: 1, activo: false });

      await expect(
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 1, idObraSocial: 1 },
          { id: 1, role: ROLES.ADMIN },
        ),
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
        turnosService.registrarTurno(
          { idMedico: 1, idPaciente: 1, idObraSocial: 1 },
          { id: 1, role: ROLES.ADMIN },
        ),
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

      const result = await turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN });

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

      const result = await turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN });

      expect(medicosModel.acceptsObraSocial).not.toHaveBeenCalled();
      expect(result.idTurno).toBe(100);
    });

    it('debería lanzar error si el médico ya tiene un turno reservado para la misma fecha y hora', async () => {
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
      turnosModel.existsByMedicoAndFechaHora.mockResolvedValue(true);

      await expect(
        turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN }),
      ).rejects.toMatchObject({
        status: 409,
        code: 'DUPLICATE_ENTRY',
        message: 'El médico ya tiene un turno reservado para la misma fecha y hora',
      });
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

      await expect(
        turnosService.registrarTurno(data, { id: 1, role: ROLES.ADMIN }),
      ).rejects.toMatchObject({
        status: 409,
        code: 'DUPLICATE_ENTRY',
        message: 'El paciente ya tiene un turno reservado para la misma fecha y hora',
      });
    });
  });

  describe('marcarComoAtendido()', () => {
    it('debería marcar un turno como atendido exitosamente', async () => {
      const mockMedico = { idMedico: 10, activo: true };
      const mockTurno = { id: 5, medico: { id: 10 }, atendido: false };

      medicosModel.findByUserId.mockResolvedValue(mockMedico);
      turnosModel.findById.mockResolvedValue(mockTurno);
      turnosModel.updateAtendido.mockResolvedValue();

      const result = await turnosService.marcarComoAtendido(5, 1);

      expect(medicosModel.findByUserId).toHaveBeenCalledWith(1);
      expect(turnosModel.findById).toHaveBeenCalledWith(5);
      expect(turnosModel.updateAtendido).toHaveBeenCalledWith(5, 1);
      expect(result.atendido).toBe(1);
    });

    it('debería lanzar FORBIDDEN si el turno no pertenece al médico', async () => {
      const mockMedico = { idMedico: 10, activo: true };
      const mockTurno = { id: 5, medico: { id: 11 }, atendido: false };

      medicosModel.findByUserId.mockResolvedValue(mockMedico);
      turnosModel.findById.mockResolvedValue(mockTurno);

      await expect(turnosService.marcarComoAtendido(5, 1)).rejects.toMatchObject({
        code: 'FORBIDDEN',
        message: 'No tiene permisos para marcar este turno como atendido',
      });
    });

    it('debería lanzar DUPLICATE_ENTRY si el turno ya fue atendido', async () => {
      const mockMedico = { idMedico: 10, activo: true };
      const mockTurno = { id: 5, medico: { id: 10 }, atendido: true };

      medicosModel.findByUserId.mockResolvedValue(mockMedico);
      turnosModel.findById.mockResolvedValue(mockTurno);

      await expect(turnosService.marcarComoAtendido(5, 1)).rejects.toMatchObject({
        code: 'DUPLICATE_ENTRY',
        message: 'El turno ya ha sido marcado como atendido',
      });
    });

    it('debería lanzar NOT_FOUND si el turno no existe', async () => {
      const mockMedico = { idMedico: 10, activo: true };
      medicosModel.findByUserId.mockResolvedValue(mockMedico);
      turnosModel.findById.mockResolvedValue(null);

      await expect(turnosService.marcarComoAtendido(5, 1)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'El turno solicitado no existe',
      });
    });
  });
});
