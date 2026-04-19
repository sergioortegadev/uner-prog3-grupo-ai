import { describe, it, expect } from 'vitest';
import { pool } from '../../src/config/db.js';
import * as obrasSocialesModel from '../../src/modules/obras_sociales/obras_sociales.model.js';
import { AppError } from '../../src/helpers/errors.helper.js';

describe('Obras Sociales Model', () => {
  it('findAllActive - debe retornar todas las obras sociales activas', async () => {
    const results = await obrasSocialesModel.findAllActive();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('findById - debe retornar null si la obra social no existe', async () => {
    const result = await obrasSocialesModel.findById(999999);
    expect(result).toBeNull();
  });

  it('create - debe reactivar una obra social inactiva', async () => {
    const name = 'Reactivate Me';
    await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 0)',
      [name, 'Old', 5],
    );

    const data = {
      nombre: name,
      descripcion: 'New',
      porcentajeDescuento: 15,
      esParticular: true,
    };

    const id = await obrasSocialesModel.create(data);
    const obra = await obrasSocialesModel.findById(id);
    expect(obra.activo).toBe(1);
    expect(obra.descripcion).toBe('New');
    expect(obra.esParticular).toBe(true);
  });

  it('create - debe lanzar AppError ER_DUP_ENTRY si el nombre ya existe activo', async () => {
    const name = 'Active OS';
    await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
      [name, 'Test', 10],
    );

    const data = { nombre: name, descripcion: 'Other' };
    await expect(obrasSocialesModel.create(data)).rejects.toThrow(AppError);
  });

  it('update - debe lanzar AppError si el objeto data está vacío', async () => {
    await expect(obrasSocialesModel.update(1, {})).rejects.toThrow(AppError);
  });

  it('update - debe actualizar múltiples campos y retornar true', async () => {
    const [res] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
      ['Update Multi', 'Desc', 10],
    );
    const id = res.insertId;

    const result = await obrasSocialesModel.update(id, {
      nombre: 'Updated Name',
      descripcion: 'Updated Desc',
      porcentajeDescuento: 25,
      esParticular: true,
    });

    expect(result).toBe(true);
    const obra = await obrasSocialesModel.findById(id);
    expect(obra.nombre).toBe('Updated Name');
    expect(obra.porcentajeDescuento).toBe(25);
  });

  it('update - debe retornar false si el ID no existe', async () => {
    const result = await obrasSocialesModel.update(999999, { nombre: 'Inexistente' });
    expect(result).toBe(false);
  });

  it('update - debe lanzar AppError ER_DUP_ENTRY si el nuevo nombre ya existe', async () => {
    await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
      ['Target Name', 'Test', 10],
    );
    const [res] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
      ['Source Name', 'Test', 10],
    );
    const id = res.insertId;

    await expect(obrasSocialesModel.update(id, { nombre: 'Target Name' })).rejects.toThrow(
      AppError,
    );
  });

  it('softDelete - debe retornar true si se borra exitosamente', async () => {
    const [res] = await pool.execute(
      'INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, activo) VALUES (?, ?, ?, 1)',
      ['Soft Delete Me', 'Test', 10],
    );
    const id = res.insertId;

    const result = await obrasSocialesModel.softDelete(id);
    expect(result).toBe(true);

    const obra = await pool.execute('SELECT activo FROM obras_sociales WHERE id_obra_social = ?', [
      id,
    ]);
    expect(obra[0][0].activo).toBe(0);
  });

  it('softDelete - debe retornar false si no existe', async () => {
    const result = await obrasSocialesModel.softDelete(999999);
    expect(result).toBe(false);
  });
});
