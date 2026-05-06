CREATE DATABASE IF NOT EXISTS prog3_turnos_test;

-- Otorgar permisos al usuario clinica_user sobre ambas bases de datos
-- (Por si el entrypoint de Docker solo le dio a la principal)
GRANT ALL PRIVILEGES ON prog3_turnos.* TO 'clinica_user'@'%';
GRANT ALL PRIVILEGES ON prog3_turnos_test.* TO 'clinica_user'@'%';

FLUSH PRIVILEGES;
