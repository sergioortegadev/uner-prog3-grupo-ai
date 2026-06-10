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

## 🩺 Especialidades (`/especialidades`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/especialidades` | Listar especialidades (soporta filtros y orden) | Admin / Paciente |
| `POST` | `/api/v1/especialidades` | Registrar nueva especialidad | Admin |
| `GET` | `/api/v1/especialidades/:id` | Obtener detalle por ID | Admin / Paciente |
| `PUT` | `/api/v1/especialidades/:id` | Actualizar nombre por ID | Admin |
| `DELETE` | `/api/v1/especialidades/:id` | Baja lógica (Soft Delete) | Admin |

### Parámetros de consulta (GET)
- `order`: Campo por el cual ordenar (`id` o `nombre`).
- `asc`: Dirección del orden (`true` o `false`).
- `limit`: Cantidad de resultados.
- Filtros directos: `activo=1`, `nombre=PEDIATRÍA`.

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
| `PATCH` | `/api/v1/medicos/:id_medico/especialidad` | Actualizar especialidad del médico | Admin |

---

## 📅 Turnos (`/turnos`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/turnos` | Listar turnos propios | Médico / Paciente |
| `POST` | `/api/v1/turnos` | Registrar un nuevo turno | Admin / Paciente |
| `PATCH` | `/api/v1/turnos/:id/atendido` | Marcar turno como atendido | Médico |

### Parámetros de consulta (GET /turnos)

| Parámetro | Tipo | Default | Descripción |
| :--- | :--- | :--- | :--- |
| `order` | string | `fecha_hora` | Campo de orden (`fecha_hora` solamente). |
| `asc` | boolean | `false` | `true` para ascendente, `false` para descendente. |
| `limit` | integer | `10` | Cantidad máxima de resultados (1–100). |
| `offset` | integer | `0` | Desplazamiento para paginación. |
| `atendido` | integer | — | Filtrar por estado de atención (`0` o `1`). |

### Respuestas

#### GET /turnos
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fechaHora": "2026-07-15 14:30:00",
      "valorTotal": 4500,
      "atendido": false,
      "activo": 1,
      "medico": { "id": 1, "apellido": "Medico", "nombres": "Doc", "especialidad": "PEDIATRÍA" },
      "paciente": { "id": 1, "apellido": "Paciente", "nombres": "User" },
      "obraSocial": { "id": 1, "nombre": "OSDE" }
    }
  ],
  "meta": { "total": 1, "limit": 10, "offset": 0, "order": "fecha_hora", "asc": false }
}
```

> **Nota:** La estructura del objeto turno varía según el rol:
> - **Médico**: incluye `paciente` (con email) y `obraSocial`, omite `medico`.
> - **Paciente**: incluye `medico` (con especialidad) y `obraSocial`, omite `paciente` (y su email).

#### PATCH /turnos/:id/atendido
```json
{
  "success": true,
  "data": {
    "id": 5,
    "atendido": true,
    "fechaHora": "2026-07-15 14:30:00"
  }
}
```

> **Nota:** El PATCH devuelve un DTO acotado , sin exponer datos personales del paciente.

#### POST /turnos (registro)
- **Administrador**: Debe pasar `idPaciente` e `idObraSocial` en el body para agendar el turno en nombre de cualquier paciente.
- **Paciente**: No debe enviar `idPaciente` ni `idObraSocial` en el body; el sistema los resuelve automáticamente de forma segura a partir de su perfil asociado.
- En ambos casos, se calcula automáticamente el `valor_total` basándose en el valor de consulta del médico y el descuento de la obra social aplicable.

---

## 📊 Estadísticas (`/turnos/estadisticas`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/turnos/estadisticas` | Obtener estadísticas operativas | Admin |

### Parámetros de consulta
- `idPaciente` (opcional): ID de un paciente para filtrar su historial en el último año. Si no se provee, devuelve el historial de **todos** los pacientes.

### Respuesta (GET /estadisticas)
```json
{
  "success": true,
  "data": {
    "turnosPorMedico": [
      { "idMedico": 1, "medico": "Perez, Juan", "cantidadTurnos": 15 }
    ],
    "turnosPorFecha": [
      { "fecha": "2026-06-08", "cantidadTurnos": 8 }
    ],
    "turnosPorEspecialidad": [
      { "idEspecialidad": 2, "especialidad": "Clínica", "cantidadTurnos": 12 }
    ],
    "turnosPacienteUltimoAnio": [
      {
        "idTurno": 5,
        "idPaciente": 4,
        "paciente": "Gomez, Luis",
        "fechaHora": "08/06/2026 10:00",
        "medico": "Perez, Juan",
        "especialidad": "Clínica",
        "atendido": true
      }
    ]
  }
}
```

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
