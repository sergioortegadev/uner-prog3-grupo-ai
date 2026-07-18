import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import passport from '../../src/config/passport.ts';
import turnosRouter from '../../src/routes/turnos.routes.ts';
import { globalErrorHandler } from '../../src/middlewares/error.middleware.ts';
import * as turnosService from '../../src/services/turnos.service.ts';
vi.mock('../../src/services/turnos.service.js', async (importOriginal) => ({
    ...(await importOriginal()),
    getStatistics: vi.fn(),
}));
vi.mock('../../src/database/usuarios.js', () => ({
    findById: vi.fn(async (id) => {
        const users = {
            1: { id: 1, rol: 3 },
            2: { id: 2, rol: 2 },
            3: { id: 3, rol: 1 },
        };
        return users[id] || null;
    }),
}));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use('/api/v1/turnos', turnosRouter);
app.use(globalErrorHandler);
describe('GET /api/v1/turnos/estadisticas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        turnosService.getStatistics.mockResolvedValue({
            turnosPorMedico: [],
            turnosPorFecha: [],
            turnosPorEspecialidad: [],
            turnosPacienteUltimoAnio: [],
        });
    });
    it('debería permitir la consulta a un administrador', async () => {
        const token = jwt.sign({ id: 1, rol: 3 }, JWT_SECRET);
        const response = await request(app)
            .get('/api/v1/turnos/estadisticas?idPaciente=4')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(turnosService.getStatistics).toHaveBeenCalledWith(4);
        expect(response.body.data).toEqual({
            turnosPorMedico: [],
            turnosPorFecha: [],
            turnosPorEspecialidad: [],
            turnosPacienteUltimoAnio: [],
        });
    });
    it('debería rechazar roles no administrativos', async () => {
        const patientToken = jwt.sign({ id: 2, rol: 2 }, JWT_SECRET);
        const doctorToken = jwt.sign({ id: 3, rol: 1 }, JWT_SECRET);
        const patientResponse = await request(app)
            .get('/api/v1/turnos/estadisticas')
            .set('Authorization', `Bearer ${patientToken}`);
        const doctorResponse = await request(app)
            .get('/api/v1/turnos/estadisticas')
            .set('Authorization', `Bearer ${doctorToken}`);
        expect(patientResponse.status).toBe(403);
        expect(doctorResponse.status).toBe(403);
        expect(turnosService.getStatistics).not.toHaveBeenCalled();
    });
    it('debería requerir autenticación', async () => {
        const response = await request(app).get('/api/v1/turnos/estadisticas');
        expect(response.status).toBe(401);
    });
    it('debería devolver estadísticas de todos los pacientes sin idPaciente', async () => {
        const token = jwt.sign({ id: 1, rol: 3 }, JWT_SECRET);
        const response = await request(app)
            .get('/api/v1/turnos/estadisticas')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(turnosService.getStatistics).toHaveBeenCalledTimes(1);
        expect(response.body.data).toEqual({
            turnosPorMedico: [],
            turnosPorFecha: [],
            turnosPorEspecialidad: [],
            turnosPacienteUltimoAnio: [],
        });
    });
    it('debería validar el ID opcional del paciente', async () => {
        const token = jwt.sign({ id: 1, rol: 3 }, JWT_SECRET);
        const response = await request(app)
            .get('/api/v1/turnos/estadisticas?idPaciente=0')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(422);
        expect(turnosService.getStatistics).not.toHaveBeenCalled();
    });
});
