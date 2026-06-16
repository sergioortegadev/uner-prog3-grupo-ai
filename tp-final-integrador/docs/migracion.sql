USE `prog3_turnos`;

-- 1. Modificar tabla `turnos_reservas` para corregir el typo de 'atentido' a 'atendido'
ALTER TABLE `turnos_reservas`
CHANGE COLUMN `atentido` `atendido` TINYINT(3) UNSIGNED NOT NULL;

-- 2. Modificar tabla `obras_sociales`
ALTER TABLE `obras_sociales`
MODIFY COLUMN `porcentaje_descuento` DECIMAL(9,4) NOT NULL,
MODIFY COLUMN `es_particular` TINYINT(1) NOT NULL DEFAULT '0';

-- Actualizar los porcentajes de descuento existentes a la nueva escala (ej: 10.00 pasa a 0.1000)
UPDATE `obras_sociales`
SET `porcentaje_descuento` = `porcentaje_descuento` / 100;

-- Insertar nueva obra social 'Particular'
INSERT INTO `obras_sociales` (`id_obra_social`, `nombre`, `descripcion`, `porcentaje_descuento`, `es_particular`, `activo`)
VALUES (5, 'Particular', 'Atención sin obra social', 0.0000, 1, 1);

-- 3. Insertar y actualizar datos de usuarios y pacientes
INSERT INTO `usuarios` (`id_usuario`, `documento`, `apellido`, `nombres`, `email`, `contrasenia`, `foto_path`, `rol`, `activo`) 
VALUES (9, '41000114', 'Perez', 'Carlos', 'carlosperez@correo.com', 'bbe8be0ee37e9f1ce1cd25893151b35b6537ff607beca72e7b19814d2c7196c2', '', 2, 1);

INSERT INTO `pacientes` (`id_paciente`, `id_usuario`, `id_obra_social`) 
VALUES (4, 9, 1);

UPDATE `usuarios` 
SET `contrasenia` = '76a8c23df7d396e6ff724af4263a4f1cb3f9858e1c29c449ac1153b34020bd26' 
WHERE `id_usuario` = 10;

-- 4. Modificar Vistas
DROP VIEW IF EXISTS `v_medicos`;
CREATE VIEW `v_medicos` AS
SELECT
    m.id_medico,
    u.apellido,
    u.nombres,
    e.nombre AS especialidad,
    m.matricula,
    m.valor_consulta,
    u.foto_path
FROM medicos m
JOIN usuarios u ON m.id_usuario = u.id_usuario
JOIN especialidades e ON m.id_especialidad = e.id_especialidad
WHERE u.activo = 1 AND e.activo = 1;

DROP VIEW IF EXISTS `v_pacientes`;
CREATE VIEW `v_pacientes` AS
SELECT
    p.id_paciente,
    p.id_usuario,
    u.apellido,
    u.nombres,
    u.email,
    os.id_obra_social,
    os.nombre AS nombre_obra_social,
    u.foto_path
FROM pacientes p
JOIN usuarios u ON p.id_usuario = u.id_usuario
JOIN obras_sociales os ON p.id_obra_social = os.id_obra_social
WHERE u.activo = 1 AND os.activo = 1;

-- 5. Crear Procedimientos Almacenados
DELIMITER $$

CREATE PROCEDURE `turnos_por_medico` ()
SELECT
  m.id_medico,
  CONCAT(u.apellido, ', ', u.nombres) AS medico,
  COUNT(tr.id_turno_reserva) AS cantidad_turnos
FROM turnos_reservas tr
INNER JOIN medicos m ON m.id_medico = tr.id_medico
INNER JOIN usuarios u ON u.id_usuario = m.id_usuario
WHERE tr.activo = 1
GROUP BY m.id_medico, u.apellido, u.nombres
ORDER BY cantidad_turnos DESC, u.apellido, u.nombres$$

CREATE PROCEDURE `turnos_por_fecha` ()
SELECT
  DATE_FORMAT(tr.fecha_hora, '%Y-%m-%d') AS fecha,
  COUNT(tr.id_turno_reserva) AS cantidad_turnos
FROM turnos_reservas tr
WHERE tr.activo = 1
GROUP BY DATE_FORMAT(tr.fecha_hora, '%Y-%m-%d')
ORDER BY fecha DESC$$

CREATE PROCEDURE `turnos_por_especialidad` ()
SELECT
  e.id_especialidad,
  e.nombre AS especialidad,
  COUNT(tr.id_turno_reserva) AS cantidad_turnos
FROM turnos_reservas tr
INNER JOIN medicos m ON m.id_medico = tr.id_medico
INNER JOIN especialidades e ON e.id_especialidad = m.id_especialidad
WHERE tr.activo = 1
GROUP BY e.id_especialidad, e.nombre
ORDER BY cantidad_turnos DESC, e.nombre$$

CREATE PROCEDURE `turnos_paciente_ultimo_anio` (IN p_id_paciente INT)
SELECT
  tr.id_turno_reserva,
  tr.id_paciente,
  CONCAT(up.apellido, ', ', up.nombres) AS paciente,
  DATE_FORMAT(tr.fecha_hora, '%d/%m/%Y %H:%i') AS fecha_hora,
  tr.id_medico,
  CONCAT(um.apellido, ', ', um.nombres) AS medico,
  e.nombre AS especialidad,
  tr.atendido
FROM turnos_reservas tr
INNER JOIN pacientes p ON p.id_paciente = tr.id_paciente
INNER JOIN usuarios up ON up.id_usuario = p.id_usuario
INNER JOIN medicos m ON m.id_medico = tr.id_medico
INNER JOIN usuarios um ON um.id_usuario = m.id_usuario
INNER JOIN especialidades e ON e.id_especialidad = m.id_especialidad
WHERE tr.activo = 1
  AND tr.fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
  AND (p_id_paciente IS NULL OR tr.id_paciente = p_id_paciente)
ORDER BY tr.fecha_hora DESC$$

DELIMITER ;
