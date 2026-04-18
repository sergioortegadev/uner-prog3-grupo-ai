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
  await pool.execute('DELETE FROM usuarios WHERE id_usuario = 5 OR email = ?', [
    'lopjac@correo.com',
  ]);
  // 2. Insertar Especialidades de prueba
  await pool.execute('DELETE FROM especialidades WHERE id_especialidad IN (1, 2)');
  await pool.execute(
    'INSERT INTO especialidades (id_especialidad, nombre, activo) VALUES (?, ?, ?), (?, ?, ?)',
    [1, 'PEDIATRÍA', 1, 2, 'CLÍNICA', 1],
  );

  // 3. Insertar Obras Sociales de prueba
  await pool.execute('DELETE FROM obras_sociales WHERE id_obra_social IN (1, 2, 4)');
  await pool.execute(
    'INSERT INTO obras_sociales (id_obra_social, nombre, descripcion, porcentaje_descuento, es_particular, activo) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
    [
      1,
      'Jerárquicos',
      'Test OS',
      10.0,
      0,
      1,
      2,
      'OSUNER',
      'Test OS 2',
      15.0,
      0,
      1,
      4,
      'OSUNER 3',
      'Test OS 3',
      20.0,
      0,
      1,
    ],
  );

  // 4. Insertar Usuario Admin de prueba
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('password123', salt);

  await pool.execute('DELETE FROM usuarios WHERE id_usuario IN (8, 5, 1)');
  await pool.execute(
    'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [8, '51000111', 'Fernandez', 'Benito', 'ferben@correo.com', hashedPassword, '', ROLES.ADMIN, 1],
  );

  // 5. Insertar Usuario Paciente de prueba
  await pool.execute(
    'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [5, '41000111', 'Lopez', 'Jacinto', 'lopjac@correo.com', hashedPassword, '', ROLES.PACIENTE, 1],
  );

  // 6. Insertar perfil de paciente (ID 1)
  await pool.execute('DELETE FROM pacientes WHERE id_paciente = 1');
  await pool.execute(
    'INSERT INTO pacientes (id_paciente, id_usuario, id_obra_social) VALUES (?, ?, ?)',
    [1, 5, 1],
  );

  // 7. Insertar Usuario 1 (Médico)
  await pool.execute(
    'INSERT INTO usuarios (id_usuario, documento, apellido, nombres, email, contrasenia, foto_path, rol, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, '31000111', 'Lopez', 'Marcelo', 'lopmar@correo.com', hashedPassword, '', ROLES.MEDICO, 1],
  );

  // 8. Insertar perfil de médico (ID 1)
  await pool.execute('DELETE FROM medicos WHERE id_medico = 1');
  await pool.execute(
    'INSERT INTO medicos (id_medico, id_usuario, id_especialidad, matricula, descripcion, valor_consulta) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 1, 1, 1000, 'Test Medico', 5000.0],
  );

  // 9. Insertar asociación médico-obra social para pruebas de duplicados
  await pool.execute(
    'DELETE FROM medicos_obras_sociales WHERE id_medico = 1 AND id_obra_social = 1',
  );
  await pool.execute(
    'INSERT INTO medicos_obras_sociales (id_medico, id_obra_social, activo) VALUES (?, ?, ?)',
    [1, 1, 1],
  );

  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
}

export async function seedTestUser() {
  await seedTestData();
}
