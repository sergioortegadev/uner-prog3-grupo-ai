import { app } from './app.js';
import { pool, closePool } from './config/db.js';

const PORT = process.env.PORT || 3000;

let server;

/**
 * Funcion principal para iniciar el servidor
 * Primero verifica la conexion a la base de datos
 */
const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Base de datos conectada con exito');

    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`👀 Observando cambios en el codigo...`);
    });
  } catch (error) {
    console.error('❌ Error fatal al conectar con la base de datos:');
    console.error(`   > ${error.message}`);
    process.exit(1); // Cerramos el proceso si no hay base de datos
  }
};

/**
 * Funcion para cerrar el servidor de forma graceful
 * Cierra el server HTTP, luego el pool de DB, y finalmente sale
 */
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Timeout de 30 segundos
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Shutdown timeout exceeded (30s)')), 30000);
  });

  try {
    // 1. Cerrar el servidor HTTP
    if (server) {
      console.log('🔐 Cerrando servidor HTTP...');
      const serverClose = new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      await Promise.race([serverClose, timeout]);
      console.log('✅ Servidor HTTP cerrado');
    }

    // 2. Cerrar el pool de conexiones
    console.log('🗄️ Cerrando pool de conexiones a la base de datos...');
    const poolClose = Promise.race([closePool(), timeout]);
    await poolClose;
    console.log('✅ Pool de conexiones cerrado');

    // 3. Salir del proceso
    console.log('👋 Apagando proceso...');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error durante el shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Registrar handlers para señales de cierre
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { startServer };

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
