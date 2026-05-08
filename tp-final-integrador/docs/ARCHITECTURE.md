# Arquitectura del Sistema - Backend

Este documento describe la arquitectura interna y los patrones de diseño implementados en el backend. El sistema está construido sobre **Node.js** y **Express 5**, utilizando una **Arquitectura de Capas (Layered Architecture)**.

## 1. Patrón Arquitectónico: Arquitectura de 4 Capas

El proyecto sigue un patrón de **Separación de Responsabilidades** dividido en capas lógicas. A diferencia de una estructura modular, aquí las responsabilidades se agrupan por su función técnica.

### Capa 1: Ruteo y Validación (`src/routes/` & `src/validators/`)
- **Responsabilidad**: Definir puntos de entrada y asegurar la integridad de los datos.
- **Acciones**:
  - `routes`: Define los endpoints y conecta con el validador y el controlador.
  - `validators`: Define esquemas de `express-validator`. Se usa el middleware `validateRequest` para interceptar errores antes de llegar al controlador.
- **Restricción**: No contiene lógica de negocio.

### Capa 2: Controlador (`src/controllers/`)
- **Responsabilidad**: Orquestar la comunicación HTTP.
- **Acciones**: Extrae datos de la petición, invoca al Servicio y envía la respuesta usando los **Response Helpers** (`successResponse`, `errorResponse`).
- **Magia Express 5**: No requiere bloques `try/catch`. Los errores asíncronos son capturados automáticamente por el `globalErrorHandler`.

### Capa 3: Servicio (`src/services/`) - *El Corazón*
- **Responsabilidad**: Implementar el 100% de la **Lógica de Negocio**.
- **Acciones**: Cálculos, validaciones de reglas de negocio, y manejo de transacciones SQL. Es agnóstico a HTTP (no conoce `req` ni `res`).

### Capa 4: Base de Datos / Persistencia (`src/database/`)
- **Responsabilidad**: Acceso directo a los datos.
- **Acciones**: Consultas SQL puras con `mysql2`. Se apoya en **Mappers** para transformar los resultados de `snake_case` (DB) a `camelCase` (JS).

---

## 2. Estructura de Directorios

La organización del código sigue una estructura centralizada por capas:

```text
src/
├── config/             # Configuración (DB, etc.)
├── constants/          # Constantes globales y de rutas
├── controllers/        # Controladores (Orquestación HTTP)
├── database/           # Capa de datos (Consultas SQL y Mappers)
├── helpers/            # Utilidades y Response Helpers
├── mappers/            # Transformación de datos
├── middlewares/        # Middlewares globales
├── routes/             # Definición de rutas y endpoints
├── services/           # Lógica de Negocio
└── validators/         # Esquemas de validación
```

---

## 3. Flujo de Datos

El flujo de una petición es siempre unidireccional:
`Cliente -> Route -> Validator -> Controller -> Service -> Database -> DB`

---

## 4. Estándares de Código y Respuestas

### Formato Único de Respuesta
Todas las respuestas deben usar los helpers de `src/helpers/response.helper.js`:
- **Éxito**: `{ success: true, data: { ... } }`
- **Error**: `{ success: false, error: { code: '...', message: '...', details: [] } }`

### Manejo de Errores
Se centraliza en `src/middlewares/error.middleware.js` usando un mapa de estados HTTP a constantes de error (`ERROR_CODES`).

---

## 4. Decisiones Técnicas

- **Soft Deletes**: Columna `activo` (1/0). Siempre filtrar por `activo = 1`.
- **Transacciones**: Se manejan en la capa de **Servicio**.
## 5. Infraestructura y Entorno

- **Versatilidad**: El proyecto está diseñado para ser agnóstico al entorno de ejecución de la base de datos.
- **XAMPP (Predeterminado)**: Compatible con la configuración estándar de la cátedra (MySQL 5.7/8.0).
- **Docker**: Se provee un `docker-compose.yml` para estandarizar versiones de MySQL (8.0) y PHPMyAdmin (5.2) entre los desarrolladores
- **Inicialización**: El archivo `init/schema.sql` es la **Única Fuente de Verdad** para la estructura de la base de datos. Cualquier cambio en la tabla debe reflejarse allí.
