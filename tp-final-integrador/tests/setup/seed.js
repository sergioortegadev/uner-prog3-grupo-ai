import bcryptjs from 'bcryptjs';
import { ROLES } from '../../src/constants/roles.constants.js';
import { pool } from '../../src/config/db.js';

export async function seedTestData() {
  // Desactivamos checks de FK para limpiar e insertar tranquilos
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

  // 1. Limpiar datos que vamos a insertar (para evitar duplicados de PK)
  await pool.execute('DELETE FROM especialidades WHERE id_especialidad = 1');
  await pool.execute('DELETE FROM obras_sociales WHERE id_obra_social = 1');
  await pool.execute('DELETE FROM usuarios WHERE id_usuario = 8 OR email = ?', [
    'ferben@correo.com',
  ]);

  // 2. Insertar Especialidad de prueba (ID 1)
  await pool.execute(
    'INSERT INTO especialidades (id_especialidad, nombre, activo) VALUES (?, ?, ?)',
    [1, 'PEDIATRÍA', 1],
  );

  // 3. Insertar Obra Social de prueba (ID 1)
  await pool.execute(
    'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 'Jerárquicos', 'Test OS', 10.0, 0, 1],
  );

  // 4. Insertar Usuario Admin de prueba
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('password123', salt);

  await pool.execute(
    'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [8, '51000111', 'Fernandez', 'Benito', 'ferben@correo.com', hashedPassword, '', ROLES.ADMIN, 1],
  );

  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
}

export async function seedTestUser() {
  await seedTestData();
}
