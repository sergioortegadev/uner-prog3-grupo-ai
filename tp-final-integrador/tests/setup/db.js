import { pool } from '../../src/config/db.js';
import { seedTestData } from './seed.js';

/**
 * Limpia todas las tablas de la base de datos de test.
 * Mantiene la seguridad de no tocar la base de desarrollo.
 */
export const clearDatabase = async () => {
  const allowedDatabases = ['prog3_turnos_test', 'prog3_final_test'];
  if (!allowedDatabases.includes(process.env.DB_NAME)) {
    throw new Error(`¡BLOQUEO DE SEGURIDAD! Intento de limpieza en: [${process.env.DB_NAME}].`);
  }

  try {
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Lista de tablas a limpiar (en orden de dependencia si fuera necesario, aunque con checks en 0 no importa tanto)
    const tables = [
      'turnos_reservas',
      'medicos_obras_sociales',
      'pacientes',
      'medicos',
      'especialidades',
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
  await seedTestData(); // Siempre tenemos al menos un Admin, Especialidad y Obra Social para los tests
};
