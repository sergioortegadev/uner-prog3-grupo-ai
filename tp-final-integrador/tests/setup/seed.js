import crypto from 'node:crypto';
import { ROLES } from '../../src/constants/roles.constants.js';
import { pool } from '../../src/config/db.js';

export async function seedTestUser() {
  const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');

  // Limpiamos usuario de prueba existente (Benito)
  await pool.execute('DELETE FROM usuarios WHERE email = ?', ['ferben@correo.com']);

  // Insertamos a Benito Fernandez (Admin) con hash SHA256
  await pool.execute(
    'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['51000111', 'Fernandez', 'Benito', 'ferben@correo.com', hashedPassword, '', ROLES.ADMIN, 1],
  );
}
