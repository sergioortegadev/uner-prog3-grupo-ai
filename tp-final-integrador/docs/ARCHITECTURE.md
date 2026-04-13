# Arquitectura del Sistema - Backend

Este documento describe la arquitectura interna y los patrones de diseño implementados en el backend. El sistema está construido sobre **Node.js** y **Express 5**, utilizando una estructura modular orientada a dominios.

## 1. Patrón Arquitectónico: Arquitectura de 4 Capas

El proyecto sigue un patrón de **Separación de Responsabilidades**  dividido en capas lógicas dentro de cada módulo funcional.

### Capa 1: Ruteo y Validación (`*.routes.js` & `*.validator.js`)
- **Responsabilidad**: Definir puntos de entrada y asegurar la integridad de los datos.
- **Acciones**:
  - `routes`: Conecta el endpoint con el validador y el controlador.
  - `validator`: Define esquemas de `express-validator`. Se usa el middleware `validateRequest` para interceptar errores antes de llegar al controlador.
- **Restricción**: No contiene lógica de negocio.

### Capa 2: Controlador (`*.controller.js`)
- **Responsabilidad**: Orquestar la comunicación HTTP.
- **Acciones**: Extrae datos de la petición, invoca al Servicio y envía la respuesta usando los **Response Helpers** (`successResponse`, `errorResponse`).
- **Magia Express 5**: No requiere bloques `try/catch`. Los errores asíncronos son capturados automáticamente por el `globalErrorHandler`.

### Capa 3: Servicio (`*.service.js`) - *El Corazón*
- **Responsabilidad**: Implementar el 100% de la **Lógica de Negocio**.
- **Acciones**: Cálculos, validaciones de reglas de negocio, y manejo de transacciones SQL. Es agnóstico a HTTP (no conoce `req` ni `res`).

### Capa 4: Modelo / Persistencia (`*.model.js`)
- **Responsabilidad**: Acceso directo a los datos.
- **Acciones**: Consultas SQL puras con `mysql2`. Mapea resultados de `snake_case` (DB) a `camelCase` (JS).

---

## 2. Estructura de un Módulo de Dominio

Ubicados en `src/modules/`, cada carpeta representa un dominio autónomo:

```text
nombre_modulo/
├── nombre_modulo.routes.js     # Definición de rutas
├── nombre_modulo.validator.js  # Esquemas de validación
├── nombre_modulo.controller.js # Orquestador HTTP
├── nombre_modulo.service.js    # Lógica de negocio
└── nombre_modulo.model.js      # Consultas SQL
```

---

## 3. Estándares de Código y Respuestas

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
