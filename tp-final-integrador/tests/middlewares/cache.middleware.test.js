import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import apicache from 'apicache';
import { cacheMiddleware, clearCacheMiddleware, CACHE_DURATIONS, } from '../../src/middlewares/cache.middleware.ts';
vi.mock('apicache', () => {
    const mockMiddleware = vi.fn(() => (req, res, next) => next());
    return {
        default: {
            options: vi.fn().mockReturnThis(),
            middleware: mockMiddleware,
            clear: vi.fn(),
        },
    };
});
describe('Cache Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.ENABLE_CACHE = 'true';
    });
    afterAll(() => {
        delete process.env.ENABLE_CACHE;
    });
    it('debería exportar duraciones de cache correctas', () => {
        expect(CACHE_DURATIONS.SHORT).toBe('5 minutes');
        expect(CACHE_DURATIONS.MEDIUM).toBe('15 minutes');
        expect(CACHE_DURATIONS.LONG).toBe('1 hour');
    });
    it('cacheMiddleware debería asignar el grupo y llamar a apicache.middleware', () => {
        const req = {};
        const res = {};
        const next = vi.fn();
        const group = 'test-group';
        const duration = CACHE_DURATIONS.SHORT;
        const middleware = cacheMiddleware(duration, group);
        middleware(req, res, next);
        expect(req.apicacheGroup).toBe(group);
        expect(apicache.middleware).toHaveBeenCalledWith(duration);
    });
    it('clearCacheMiddleware debería llamar a apicache.clear al finalizar la respuesta exitosa', () => {
        const req = {};
        const res = {
            statusCode: 200,
            on: vi.fn((event, cb) => {
                if (event === 'finish') {
                    // Simulamos que el evento finish ocurre
                    cb();
                }
            }),
        };
        const next = vi.fn();
        const group = 'test-group';
        const middleware = clearCacheMiddleware(group);
        middleware(req, res, next);
        expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(apicache.clear).toHaveBeenCalledWith(group);
        expect(next).toHaveBeenCalled();
    });
    it('clearCacheMiddleware NO debería llamar a apicache.clear si la respuesta falla', () => {
        const req = {};
        const res = {
            statusCode: 400,
            on: vi.fn((event, cb) => {
                if (event === 'finish') {
                    cb();
                }
            }),
        };
        const next = vi.fn();
        const group = 'test-group';
        const middleware = clearCacheMiddleware(group);
        middleware(req, res, next);
        expect(apicache.clear).not.toHaveBeenCalled();
    });
});
