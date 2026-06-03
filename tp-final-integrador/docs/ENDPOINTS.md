# Referencia de Endpoints (API v1)

Este documento detalla los endpoints disponibles en la API para facilitar las pruebas y la revisión por parte de la cátedra. Swagger será implementado en una etapa posterior.

## 🏥 Obras Sociales (`/obras-sociales`)


| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/v1/obras-sociales` | Listar todas (soporta filtros y orden) |
| `POST` | `/api/v1/obras-sociales` | Registrar nueva obra social |
| `GET` | `/api/v1/obras-sociales/:id` | Obtener detalle por ID |
| `PUT` | `/api/v1/obras-sociales/:id` | Actualizar datos por ID |
| `DELETE` | `/api/v1/obras-sociales/:id` | Baja lógica (Soft Delete) |

### Parámetros de consulta (GET)
- `order`: Campo por el cual ordenar (`id`, `nombre`, `porcentajeDescuento` o `activo`).
- `asc`: Dirección del orden (`true` o `false`).
- `limit`: Cantidad de resultados.
- Filtros directos: `activo=1`, `nombre=Jerárquicos`.

---

## ⚙️ Sistema (`/health`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Estado de la API y conexión a DB | Público |

---

## 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Iniciar sesión y obtener JWT | Público |

---

## 👨‍⚕️ Médicos (`/medicos`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/medicos/:id/obras-sociales` | Asociar múltiples obras sociales | Admin |

---



---

## 🛠️ Colección de Pruebas

Para una prueba rápida, recomendamos usar la colección de **Bruno** ubicada en:
`tp-final-integrador/bruno-collection/`

### Pasos para configurar:

1. **Abrir la colección**:
   - Abrí la aplicación Bruno.
   - Hacé clic en **"Open Collection"** en la pantalla de inicio.
   - Seleccioná la carpeta `bruno-collection` que se encuentra en la raíz de este proyecto.

   ![Abrir colección](./images/bruno-open.jpeg)

2. **Seleccionar el Entorno (Environment)**:
   - Una vez abierta, hacé clic en el selector de entornos en la esquina superior derecha (donde dice "No Environment").
   - Seleccioná **"Development"**. Esto cargará las variables necesarias (como la URL base de la API).

   ![Seleccionar entorno](./images/bruno-env.jpeg)
