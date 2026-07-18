import { describe, it, expect, beforeEach } from 'vitest';
import * as medicosModel from '../../src/database/medicos.ts';
import { pool } from '../../src/config/db.ts';
import { setupTestDB } from '../setup/db.ts';
import { DB_STATUS } from '../../src/constants/common.constants.ts';
import { ROLES } from '../../src/constants/roles.constants.ts';
describe('Médicos Model - Integration Tests', () => {
    let userId, medicoId, espId, osId;
    beforeEach(async () => {
        await setupTestDB();
        // 1. Especialidad
        const [espRes] = await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, 1)', ['CARDIOLOGÍA']);
        espId = espRes.insertId;
        // 2. Usuario
        const [uRes] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['100', 'Doc', 'One', 'doc1@test.com', 'hash', '', ROLES.MEDICO, 1]);
        userId = uRes.insertId;
        // 3. Médico
        const [mRes] = await pool.execute('INSERT INTO medicos (id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?)', [userId, espId, 1001, 5000]);
        medicoId = mRes.insertId;
        // 4. Obra Social
        const [osRes] = await pool.execute('INSERT INTO obras_sociales (nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?)', ['OSDE', 'Prepaga', 20, 0, 1]);
        osId = osRes.insertId;
    });
    describe('findById()', () => {
        it('debería retornar el médico si existe', async () => {
            const medico = await medicosModel.findById(medicoId);
            expect(medico).not.toBeNull();
            expect(medico.idMedico).toBe(medicoId);
            expect(medico.matricula).toBe(1001);
        });
        it('debería retornar null si no existe', async () => {
            const medico = await medicosModel.findById(9999);
            expect(medico).toBeNull();
        });
    });
    describe('findByUserId()', () => {
        it('debería retornar el médico por id_usuario', async () => {
            const medico = await medicosModel.findByUserId(userId);
            expect(medico.idMedico).toBe(medicoId);
        });
    });
    describe('findAll()', () => {
        it('debería retornar solo médicos con usuario activo', async () => {
            // Inactive doctor
            const [u2Res] = await pool.execute('INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['200', 'Doc', 'Two', 'doc2@test.com', 'hash', '', ROLES.MEDICO, 0]);
            await pool.execute('INSERT INTO medicos (id_usuario, id_especialidad, matricula, valor_consulta) VALUES (?, ?, ?, ?)', [u2Res.insertId, espId, 2002, 6000]);
            const medicos = await medicosModel.findAll();
            expect(medicos).toHaveLength(1);
            expect(medicos[0].idMedico).toBe(medicoId);
        });
    });
    describe('Obras Sociales logic', () => {
        it('acceptsObraSocial debería retornar true si está asociada y activa', async () => {
            await pool.execute('INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)', [medicoId, osId, DB_STATUS.ACTIVE]);
            const accepts = await medicosModel.acceptsObraSocial(medicoId, osId);
            expect(accepts).toBe(true);
        });
        it('getObrasSocialesIds debería retornar lista de IDs activos', async () => {
            await pool.execute('INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)', [medicoId, osId, DB_STATUS.ACTIVE]);
            const ids = await medicosModel.getObrasSocialesIds(medicoId);
            expect(ids).toContain(osId);
            expect(ids).toHaveLength(1);
        });
    });
    describe('assignObrasSociales()', () => {
        it('debería crear nuevas asociaciones', async () => {
            await medicosModel.assignObrasSociales(medicoId, [osId]);
            const ids = await medicosModel.getObrasSocialesIds(medicoId);
            expect(ids).toContain(osId);
        });
        it('debería reactivar asociaciones inactivas', async () => {
            await pool.execute('INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)', [medicoId, osId, DB_STATUS.INACTIVE]);
            await medicosModel.assignObrasSociales(medicoId, [osId]);
            const ids = await medicosModel.getObrasSocialesIds(medicoId);
            expect(ids).toContain(osId);
        });
        it('debería hacer rollback si falla una inserción', async () => {
            // Forzar error: osId inexistente (violación FK)
            try {
                await medicosModel.assignObrasSociales(medicoId, [9999]);
            }
            catch {
                // error esperado
            }
            const ids = await medicosModel.getObrasSocialesIds(medicoId);
            expect(ids).toHaveLength(0);
        });
    });
    describe('updateEspecialidad()', () => {
        it('debería actualizar el campo id_especialidad', async () => {
            const [esp2Res] = await pool.execute('INSERT INTO especialidades (nombre, activo) VALUES (?, 1)', ['OTRA']);
            const esp2Id = esp2Res.insertId;
            const result = await medicosModel.updateEspecialidad(medicoId, esp2Id);
            expect(result).toBe(true);
            const medico = await medicosModel.findById(medicoId);
            expect(medico.idEspecialidad).toBe(esp2Id);
        });
    });
});
