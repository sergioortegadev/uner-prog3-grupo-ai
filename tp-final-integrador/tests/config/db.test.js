import { describe, it, expect } from 'vitest';

describe('Database Configuration', () => {
  it('should export a connection pool from mysql2', async () => {
    const { pool } = await import('../../src/config/db.js');

    expect(pool).toBeDefined();
    expect(typeof pool.execute).toBe('function');
  });
});
