import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Esto asegura que Vitest use el pool de hilos correcto
    pool: 'forks',
    // Aquí podrías agregar más configuración global
    environment: 'node',
    // Podemos forzar variables de entorno aquí si fuera necesario
    env: {
      NODE_ENV: 'test',
      DB_NAME: 'prog3_final_test'
    }
  },
});
