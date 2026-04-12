import { describe, it, expect } from 'vitest';
import { pool } from '../../src/config/db.js';

describe('Database Seeder', () => {
  it('should seed a test user into the database', async () => {
    // Attempt to import the seeder (which doesn't exist yet)
    const { seedTestUser } = await import('../../tests/setup/seed.js');

    await seedTestUser();

    // Verify user was inserted
    const [rows] = await pool.execute('SELECT email, rol, activo FROM usuarios WHERE email = ?', [
      'test@clinica.com',
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe('test@clinica.com');
    expect(rows[0].rol).toBe(3); // Admin for testing
    expect(rows[0].activo).toBe(1);
  });
});
