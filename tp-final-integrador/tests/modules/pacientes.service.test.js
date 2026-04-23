import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as pacientesService from '../../src/modules/pacientes/pacientes.service.js';
import * as pacientesModel from '../../src/modules/pacientes/pacientes.model.js';
import * as usuariosModel from '../../src/modules/usuarios/usuarios.model.js';

vi.mock('../../src/modules/pacientes/pacientes.model.js');
vi.mock('../../src/modules/usuarios/usuarios.model.js');

describe('Pacientes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('actualizarObraSocial', () => {
    it('debe lanzar error 422 si la obra social no existe', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue(null);

      await expect(pacientesService.actualizarObraSocial(1, 99)).rejects.toMatchObject({
        status: 422,
        message: 'La obra social especificada no existe',
      });
    });

    it('debe lanzar error 404 si el paciente no existe', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 1 });
      pacientesModel.findById.mockResolvedValue(null);

      await expect(pacientesService.actualizarObraSocial(99, 1)).rejects.toMatchObject({
        status: 404,
        message: 'El paciente no existe',
      });
    });

    it('debe llamar al modelo para actualizar si todo es correcto', async () => {
      usuariosModel.findObraSocialById.mockResolvedValue({ id_obra_social: 2 });
      pacientesModel.findById.mockResolvedValue({ id_paciente: 1 });

      await pacientesService.actualizarObraSocial(1, 2);
      expect(pacientesModel.updateObraSocial).toHaveBeenCalledWith(1, 2);
    });
  });
});
