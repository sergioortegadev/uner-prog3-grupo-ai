CREATE DATABASE IF NOT EXISTS prog3_final_test;
-- Nos aseguramos de que el usuario tenga permisos en la de test con el nuevo nombre
GRANT ALL PRIVILEGES ON prog3_final_test.* TO 'clinica_user'@'%';
FLUSH PRIVILEGES;
