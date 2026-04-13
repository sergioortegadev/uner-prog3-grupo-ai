import bcryptjs from 'bcryptjs';
import { pool } from '../../src/config/db.js';

export async function seedTestUser() {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('password123', salt);

  // Limpiamos usuario de prueba existente (Benito)
  await pool.execute('DELETE FROM usuarios WHERE email = ?', ['ferben@correo.com']);

  // Insertamos a Benito Fernandez (Admin) con hash bcrypt
  await pool.execute(
    'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['51000111', 'Fernandez', 'Benito', 'ferben@correo.com', hashedPassword, '', 3, 1],
  );
}
