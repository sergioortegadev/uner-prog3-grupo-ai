# Changelog del Esquema de Base de Datos (schema.sql)

Este archivo registra todos los cambios estructurales realizados en la base de datos desde la creación del proyecto.

## [1.0.0] - 2026-04-11
### Added
- Creación inicial del esquema relacional para la gestión de turnos médicos.
- **Tablas**:
  - `especialidades`: Almacena las especialidades médicas.
  - `medicos`: Perfiles de profesionales de la salud.
  - `usuarios`: Datos de autenticación y perfiles generales.
  - `obras_sociales`: Listado de coberturas médicas.
  - `pacientes`: Perfiles de pacientes asociados a obras sociales.
  - `medicos_obras_sociales`: Relación N-N entre médicos y sus coberturas aceptadas.
  - `turnos_reservas`: Registro central de turnos y atención.
- **Vistas**:
  - `v_medicos`: Vista consolidada de datos de médicos (incluye nombres y especialidad).
  - `v_pacientes`: Vista consolidada de datos de pacientes (incluye nombres y obra social).
- **Procedimientos**:
  - `especialidades_x_turnos`: Generación de estadísticas de turnos por especialidad.

## [1.1.0] - 2026-04-15
### Changed
- **Tabla `usuarios`**:
  - La columna `foto_path` ahora permite valores `NULL` (`DEFAULT NULL`). Esto permite el registro de usuarios sin requerir una foto obligatoria en el primer paso.

## [1.2.0] - 2026-04-18
### Added
- **Vista `v_medicos`**:
  - Se agregó la columna `id_especialidad` a la vista. Esto facilita la filtración de médicos por el identificador único de su especialidad desde el frontend o servicios internos.

---
*Nota: Este log se genera automáticamente analizando el historial del archivo `tp-final-integrador/init/schema.sql`.*
