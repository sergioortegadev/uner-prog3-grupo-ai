import { ROLES } from '../../src/constants/roles.constants.ts';
import { pool } from '../../src/config/db.ts';

export async function seedTestUser() {
  // Limpiamos usuario de prueba existente (Benito)
  await pool.execute('DELETE FROM usuarios WHERE email = ?', ['ferben@correo.com']);

  // Insertamos a Benito Fernandez (Admin) con hash SHA2-256 y id_usuario = 8
  await pool.execute(
    'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, SHA2(?, 256), ?, ?, ?)',
    [8, '51000111', 'Fernandez', 'Benito', 'ferben@correo.com', 'password123', '', ROLES.ADMIN, 1],
  );
}
