import { beforeAll } from 'vitest';
import { setupTestDB } from './db.js';

/**
 * Setup global para Vitest.
 * Se encarga de inicializar la base de datos antes de cada archivo de test.
 */
beforeAll(async () => {
  // Verificación de carga de .env.test
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ ADVERTENCIA: NODE_ENV no es "test". Revisa la carga de variables de entorno.');
  }

  await setupTestDB();
});
