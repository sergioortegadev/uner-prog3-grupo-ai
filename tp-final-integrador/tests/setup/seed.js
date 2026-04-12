import bcryptjs from 'bcryptjs';
import { pool } from '../../src/config/db.js';

export async function seedTestUser() {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('password123', salt);

  // Limpiamos usuario de prueba existente
  await pool.execute('DELETE FROM usuarios WHERE email = ?', ['test@clinica.com']);

  // Insertamos usuario de prueba incluyendo foto_path (requerido por el schema)
  await pool.execute(
    'INSERT INTO usuarios (documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['12345678', 'Doe', 'John', 'test@clinica.com', hashedPassword, '', 3, 1],
  );
}
