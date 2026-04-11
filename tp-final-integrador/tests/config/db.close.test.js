import { describe, it, expect } from 'vitest';

describe('Database Configuration - closePool', () => {
  it('should export a closePool function', async () => {
    const { closePool } = await import('../../src/config/db.js');
    
    expect(closePool).toBeDefined();
    expect(typeof closePool).toBe('function');
  });

  it('closePool should return a promise', async () => {
    const { closePool } = await import('../../src/config/db.js');
    
    const result = closePool();
    expect(result).toBeInstanceOf(Promise);
    await result;
  });
});