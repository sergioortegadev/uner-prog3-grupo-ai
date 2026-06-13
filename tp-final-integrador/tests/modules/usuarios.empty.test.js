import { describe, it, expect, beforeAll } from 'vitest';
import * as usuariosModel from '../../src/database/usuarios.js';
import { pool } from '../../src/config/db.js';

describe('Usuarios Model - Empty Results', () => {
  beforeAll(async () => {
    // Limpiamos la tabla de usuarios para asegurar que esté vacía
    // NOTA: Esto solo se ejecuta en la DB de test (prog3_turnos_test)
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('DELETE FROM usuarios');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
  });

  it('findAll debe devolver un array vacío [] cuando no hay usuarios activos', async () => {
    const result = await usuariosModel.findAll();

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
