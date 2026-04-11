import { pool } from '../../config/db.js';

/**
 * Obtiene la versión del motor de base de datos
 */
export const getDatabaseVersion = async () => {
  const [rows] = await pool.query('SELECT VERSION() as version');
  return rows[0].version;
};

/**
 * Obtiene la configuración de conexiones máximas
 */
export const getMaxConnections = async () => {
  const [rows] = await pool.query("SHOW VARIABLES LIKE 'max_connections'");
  return parseInt(rows[0].Value, 10);
};

/**
 * Obtiene la cantidad de conexiones abiertas actualmente
 */
export const getActiveConnections = async () => {
  const [rows] = await pool.query("SHOW STATUS LIKE 'Threads_connected'");
  return parseInt(rows[0].Value, 10);
};
