import { describe, it, expect } from 'vitest';
import * as healthModel from '../../src/modules/health/health.model.js';

describe('Health Model', () => {
  it('getDatabaseVersion - debe retornar la versión de la base de datos como string', async () => {
    const version = await healthModel.getDatabaseVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('getMaxConnections - debe retornar el número máximo de conexiones configuradas', async () => {
    const maxConn = await healthModel.getMaxConnections();
    expect(typeof maxConn).toBe('number');
    expect(maxConn).toBeGreaterThan(0);
  });

  it('getActiveConnections - debe retornar la cantidad de hilos conectados actualmente', async () => {
    const activeConn = await healthModel.getActiveConnections();
    expect(typeof activeConn).toBe('number');
    expect(activeConn).toBeGreaterThan(0);
  });
});
