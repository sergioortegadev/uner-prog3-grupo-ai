import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as obrasSocialesModel from '../../src/database/obras_sociales.ts';
import { pool } from '../../src/config/db.ts';

// Mockeamos el pool de la base de datos
vi.mock('../../src/config/db.js', () => ({
  pool: {
    execute: vi.fn(),
  },
}));

describe('Obras Sociales Model - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('update()', () => {
    it('debería lanzar un error explícito si el objeto de datos está vacío (Objeto de datos vacío)', async () => {
      // Este test valida el throw new Error('No hay campos válidos para actualizar')
      await expect(obrasSocialesModel.update(1, {})).rejects.toThrow(
        'No hay campos válidos para actualizar',
      );
    });

    it('debería propagar errores de infraestructura de la base de datos (Fallo de infraestructura)', async () => {
      // Simulamos que el pool falla (ej. base de datos caída)
      pool.execute.mockRejectedValue(new Error('DB Connection Lost'));

      await expect(obrasSocialesModel.update(1, { nombre: 'Nuevo Nombre' })).rejects.toThrow(
        'DB Connection Lost',
      );
    });

    it('debería propagar errores de duplicidad de la base de datos (Unique Constraint)', async () => {
      // Simulamos el error que lanza MySQL cuando hay una violación de unicidad
      const dbError = new Error("Duplicate entry 'OSDE' for key 'nombre'");
      dbError.code = 'ER_DUP_ENTRY';
      pool.execute.mockRejectedValue(dbError);

      await expect(obrasSocialesModel.update(1, { nombre: 'OSDE' })).rejects.toThrow(
        'Duplicate entry',
      );
    });

    it('debería retornar false si no se actualizó ninguna fila (Inexistencia por concurrencia)', async () => {
      // Simulamos que affectedRows es 0 (porque alguien borró la fila entre el check y el update)
      pool.execute.mockResolvedValue([{ affectedRows: 0 }]);

      const result = await obrasSocialesModel.update(1, { nombre: 'OSDE' });

      expect(result).toBe(false);
      expect(pool.execute).toHaveBeenCalled();
    });

    it('debería retornar true si la actualización fue exitosa', async () => {
      pool.execute.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await obrasSocialesModel.update(1, { nombre: 'OSDE' });

      expect(result).toBe(true);
    });
  });
});
