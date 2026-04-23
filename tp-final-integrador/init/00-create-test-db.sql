-- Creamos las bases de datos de test
CREATE DATABASE IF NOT EXISTS prog3_turnos_test;
CREATE DATABASE IF NOT EXISTS prog3_final_test;

-- En MySQL 8, debemos crear al usuario explícitamente antes de darle permisos si no existe
-- El usuario 'clinica_user' lo crea el entrypoint de docker desde el .env normal
-- Pero como en .env.test usamos 'test_user', lo creamos acá también:
CREATE USER IF NOT EXISTS 'test_user'@'%' IDENTIFIED BY 'test1234';

-- Permisos para test_user (usado en vitest .env.test)
GRANT ALL PRIVILEGES ON prog3_turnos_test.* TO 'test_user'@'%';
GRANT ALL PRIVILEGES ON prog3_final_test.* TO 'test_user'@'%';

-- Aseguramos permisos también para clinica_user por las dudas
GRANT ALL PRIVILEGES ON prog3_turnos_test.* TO 'clinica_user'@'%';
GRANT ALL PRIVILEGES ON prog3_final_test.* TO 'clinica_user'@'%';

FLUSH PRIVILEGES;
