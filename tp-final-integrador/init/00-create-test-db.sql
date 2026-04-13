CREATE DATABASE IF NOT EXISTS prog3_turnos_test;
-- Nos aseguramos de que los posibles usuarios tengan permisos
GRANT ALL PRIVILEGES ON prog3_turnos_test.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON prog3_turnos_test.* TO 'clinica_user'@'%';
FLUSH PRIVILEGES;
