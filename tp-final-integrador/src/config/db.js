import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'clinica_user',
  password: process.env.DB_PASS || 'clinica1234',
  database: process.env.DB_NAME || 'prog3_turnos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const closePool = async () => {
  await pool.end();
};

export { pool, closePool };
