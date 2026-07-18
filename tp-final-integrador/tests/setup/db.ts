import { pool } from '../../src/config/db.ts';
import { seedTestUser } from './seed.ts';

const recreateViews = async () => {
  if (process.env.DB_NAME !== 'prog3_turnos_test') {
    throw new Error(`¡BLOQUEO DE SEGURIDAD! Intento de recrear vistas en: [${process.env.DB_NAME}].`);
  }

  await pool.execute('DROP VIEW IF EXISTS v_medicos');
  await pool.execute('DROP VIEW IF EXISTS v_pacientes');

  await pool.execute(`
    CREATE VIEW v_medicos AS
    SELECT
      m.id_medico,
      m.id_usuario,
      m.id_especialidad,
      u.apellido,
      u.nombres,
      u.documento,
      u.email,
      e.nombre AS especialidad,
      m.matricula,
      m.valor_consulta,
      u.foto_path,
      u.activo
    FROM medicos m
    JOIN usuarios u ON m.id_usuario = u.id_usuario
    JOIN especialidades e ON m.id_especialidad = e.id_especialidad
  `);

  await pool.execute(`
    CREATE VIEW v_pacientes AS
    SELECT
      p.id_paciente,
      p.id_usuario,
      p.id_obra_social,
      os.nombre AS nombre_obra_social,
      u.apellido,
      u.nombres,
      u.documento,
      u.email,
      u.foto_path,
      u.activo
    FROM pacientes p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    LEFT JOIN obras_sociales os ON p.id_obra_social = os.id_obra_social
  `);
};

/**
 * Limpia todas las tablas de la base de datos de test.
 * Mantiene la seguridad de no tocar la base de desarrollo.
 */
export const clearDatabase = async () => {
  if (process.env.DB_NAME !== 'prog3_turnos_test') {
    throw new Error(`¡BLOQUEO DE SEGURIDAD! Intento de limpieza en: [${process.env.DB_NAME}].`);
  }

  try {
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Lista de tablas a limpiar
    const tables = [
      'especialidades',
      'turnos_reservas',
      'medicos_obras_sociales',
      'pacientes',
      'medicos',
      'obras_sociales',
      'usuarios',
    ];

    for (const table of tables) {
      await pool.execute(`DELETE FROM ${table}`);
    }

    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error en el Conserje de DB (limpieza):', error.message);
    throw error;
  }
};

/**
 * Prepara un ambiente de test completo: limpia y carga datos básicos.
 */
export const setupTestDB = async () => {
  await clearDatabase();
  await recreateViews();
  await seedTestUser(); // Siempre tenemos al menos un Admin para los tests
};
