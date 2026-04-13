import { describe, it, expect } from 'vitest';
import { seedTestUser } from './seed.js';
import { pool } from '../../src/config/db.js';

describe('Database Seeder', () => {
  it('should seed a test user into the database', async () => {
    await seedTestUser();

    const [rows] = await pool.execute('SELECT email, rol, activo FROM usuarios WHERE email = ?', [
      'ferben@correo.com',
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe('ferben@correo.com');
    expect(rows[0].rol).toBe(3); // Admin for testing
    expect(rows[0].activo).toBe(1);
  });
});
