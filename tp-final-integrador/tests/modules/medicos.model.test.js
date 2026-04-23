import { describe, it, expect, beforeEach } from 'vitest';
import { pool } from '../../src/config/db.js';
import * as medicosModel from '../../src/modules/medicos/medicos.model.js';
import { setupTestDB } from '../setup/db.js';

describe('Medicos Model', () => {
  beforeEach(async () => {
    await setupTestDB();
  });

  it('findAll - debe retornar una lista de médicos (v_medicos)', async () => {
    const medicos = await medicosModel.findAll();
    expect(Array.isArray(medicos)).toBe(true);
    expect(medicos.length).toBeGreaterThan(0);
    // Verificamos que traiga las columnas de la vista v_medicos
    expect(medicos[0]).toHaveProperty('id_medico');
    expect(medicos[0]).toHaveProperty('apellido');
    expect(medicos[0]).toHaveProperty('especialidad');
  });

  it('findAll - debe filtrar por id_especialidad', async () => {
    // El ID 1 en el seed suele ser PEDIATRÍA
    const idEsp = 1;
    const medicos = await medicosModel.findAll(idEsp);

    expect(medicos.length).toBeGreaterThan(0);
    const ids = medicos.map((m) => m.id_medico);
    for (const id of ids) {
      const [rows] = await pool.execute('SELECT id_especialidad FROM medicos WHERE id_medico = ?', [
        id,
      ]);
      expect(rows[0].id_especialidad).toBe(idEsp);
    }
  });

  it('findById - debe retornar un médico por ID', async () => {
    // ID 1 es el médico del seed
    const medico = await medicosModel.findById(1);
    expect(medico).not.toBeNull();
    expect(medico.id_medico).toBe(1);
  });

  it('findById - debe retornar null si no existe', async () => {
    const medico = await medicosModel.findById(999);
    expect(medico).toBeNull();
  });

  it('updateEspecialidad - debe cambiar la especialidad del médico', async () => {
    // Especialidad 2 existe en seed (CLÍNICA)
    await medicosModel.updateEspecialidad(1, 2);

    const [rows] = await pool.execute('SELECT id_especialidad FROM medicos WHERE id_medico = 1');
    expect(rows[0].id_especialidad).toBe(2);
  });

  it('findObraSocialAsociada - debe encontrar asociación activa', async () => {
    // El seed inserta médico 1 con OS 1 activa
    const asociacion = await medicosModel.findObraSocialAsociada(1, 1);
    expect(asociacion).not.toBeNull();
    expect(asociacion.activo).toBe(1);
  });

  it('addObraSocial - debe crear una nueva asociación', async () => {
    // Usamos OS 2 que existe en seed
    await medicosModel.addObraSocial(1, 2);

    const [rows] = await pool.execute(
      'SELECT activo FROM medicos_obras_sociales WHERE id_medico = 1 AND id_obra_social = 2',
    );
    expect(rows[0].activo).toBe(1);
  });

  it('addObraSocial - debe reactivar una asociación inactiva', async () => {
    // Primero la desactivamos manualmente
    await pool.execute(
      'INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)',
      [1, 4, 0], // OS 4 existe en seed
    );

    const [existing] = await pool.execute(
      'SELECT id_medico_obra_social FROM medicos_obras_sociales WHERE id_medico = 1 AND id_obra_social = 4',
    );
    const idAsoc = existing[0].id_medico_obra_social;

    await medicosModel.addObraSocial(1, 4, idAsoc);

    const [rows] = await pool.execute(
      'SELECT activo FROM medicos_obras_sociales WHERE id_medico_obra_social = ?',
      [idAsoc],
    );
    expect(rows[0].activo).toBe(1);
  });

  it('removeObraSocial - debe realizar borrado lógico de la asociación', async () => {
    // El seed tiene med:1, os:1 activo
    await medicosModel.removeObraSocial(1, 1);

    const [rows] = await pool.execute(
      'SELECT activo FROM medicos_obras_sociales WHERE id_medico = 1 AND id_obra_social = 1',
    );
    expect(rows[0].activo).toBe(0);
  });
});
