import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pool } from '../../src/config/db.ts';
import * as turnosModel from '../../src/database/turnos.ts';
vi.mock('../../src/config/db.js', () => ({
    pool: {
        query: vi.fn(),
        execute: vi.fn(),
    },
    closePool: vi.fn(),
}));
describe('Turnos Statistics - Model Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('debería pasar null al SP cuando no se provee idPaciente', async () => {
        pool.query.mockResolvedValue([[[]]]);
        await turnosModel.getStatistics(null);
        expect(pool.query).toHaveBeenNthCalledWith(4, 'CALL turnos_paciente_ultimo_anio(?)', [null]);
    });
    it('debería obtener todas las estadísticas mediante procedimientos almacenados', async () => {
        pool.query
            .mockResolvedValueOnce([[[{ id_medico: 1, medico: 'Perez, Ana', cantidad_turnos: 3 }]]])
            .mockResolvedValueOnce([[[{ fecha: '2026-06-08', cantidad_turnos: 2 }]]])
            .mockResolvedValueOnce([
            [[{ id_especialidad: 2, especialidad: 'Clínica', cantidad_turnos: 3 }]],
        ])
            .mockResolvedValueOnce([
            [
                [
                    {
                        id_turno_reserva: 5,
                        id_paciente: 4,
                        paciente: 'Gomez, Luis',
                        fecha_hora: '08/06/2026 10:00',
                        id_medico: 1,
                        medico: 'Perez, Ana',
                        especialidad: 'Clínica',
                        atendido: 1,
                    },
                ],
            ],
        ]);
        const result = await turnosModel.getStatistics(4);
        expect(pool.query).toHaveBeenNthCalledWith(1, 'CALL turnos_por_medico()');
        expect(pool.query).toHaveBeenNthCalledWith(2, 'CALL turnos_por_fecha()');
        expect(pool.query).toHaveBeenNthCalledWith(3, 'CALL turnos_por_especialidad()');
        expect(pool.query).toHaveBeenNthCalledWith(4, 'CALL turnos_paciente_ultimo_anio(?)', [4]);
        expect(result.turnosPorMedico[0].cantidadTurnos).toBe(3);
        expect(result.turnosPorFecha[0].cantidadTurnos).toBe(2);
        expect(result.turnosPorEspecialidad[0].idEspecialidad).toBe(2);
        expect(result.turnosPacienteUltimoAnio[0]).toEqual(expect.objectContaining({
            idTurno: 5,
            idPaciente: 4,
            atendido: true,
        }));
    });
});
