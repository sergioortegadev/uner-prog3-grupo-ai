import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno de .env.test (y otros .env si existen)
  const env = loadEnv(mode, process.cwd(), '');

  process.env = { ...process.env, ...env };

  return {
    test: {
      // Esto asegura que Vitest use el pool de hilos correcto
      pool: 'forks',
      fileParallelism: false,
      environment: 'node',
      setupFiles: ['./tests/setup/vitest.setup.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'tests/setup/'],
      },
    },
  };
});
