# Backend API REST

> **Trabajo Final Integrador** · Programación III · 2026
> **Tecnicatura Universitaria en Desarrollo Web**
> **Facultad de Ciencias de la Administración – UNER**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-3c873a?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-%23fff?style=flat-square)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-00758f?style=flat-square&logo=mysql)](https://mysql.com)
[![JWT](https://img.shields.io/badge/JAuth-Token-green?style=flat-square)](https://jwt.io)

---

## 👥 Integrantes - Grupo AI

| #   | Apellido y Nombre        |
| --- | ------------------------ |
| 1   | Belardita Horacio Daniel |
| 2   | Berón Tomás Manuel       |
| 3   | Leiva Enzo               |
| 4   | Ortega Sergio            |
| 5   | Sandoval Edgardo         |

---

## 📝 Descripción del Proyecto

Desarrollo de una API REST robusta para la gestión integral de una clínica médica. El sistema permite la administración de especialidades, médicos, pacientes y obras sociales, junto con un sistema de reserva de turnos transaccional.

### Requisitos Técnicos Implementados:

- **Arquitectura**: Arquitectura de capas (Layered Architecture) de 4 capas.
- **Seguridad**: Autenticación con JWT y autorización por Roles.
- **Base de Datos**: MySQL con soporte para Transacciones y Stored Procedures.
- **Calidad**: Validaciones con `express-validator`, logs con `Morgan` y borrado lógico (Soft Delete).
- **Documentación**: [Referencia de Endpoints](./docs/ENDPOINTS.md).

---

## 🚀 Guía de Inicio

### 1. Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

### 2. Base de Datos

El proyecto está preparado para funcionar de dos maneras. **Docker es opcional** .

> **Nota para la Cátedra (Migración de Base de Datos):**
> El archivo `init/schema.sql` contiene la versión final y optimizada de la base. Si se desea partir desde el modelo de datos original provisto en clases , hemos adjuntado el script **`docs/migracion.sql`**. Este archivo contiene todos los comandos (`ALTER`, `UPDATE`, `CREATE VIEW` y `CREATE PROCEDURE`) para migrar la base original y dejarla idéntica a nuestro `schema.sql`.

- **Opción A (XAMPP / Manual)**:
  1. Iniciá el módulo MySQL en el Panel de Control de XAMPP.
  2. Creá una base de datos llamada `prog3_turnos` (o el nombre que prefieras).
  3. Importá el archivo `init/schema.sql` (contiene la estructura corregida y datos de prueba).
  4. En el `.env`, configurá `DB_USER=root` y `DB_PASS=` (vacío).

- **Opción B (Docker - Opcional/Rápido)**:
  1. Asegurate de tener Docker Desktop corriendo.
  2. Ejecutá `npm run infra:up`. Esto levanta MySQL 8 y phpMyAdmin automáticamente.
  3. Accedé al administrador en: [http://localhost:8080](http://localhost:8080).
  4. En el `.env`, descomentá las variables de la sección "Docker" y comenta las de la seccion "XAMPP".

### 3. Ejecución

```bash
npm run dev # Inicia el servidor con auto-reload
```

---

## 🏗️ Guía para Desarrolladores

Si vas a contribuir al código, por favor leé nuestra **[Guía de Contribución](./CONTRIBUTING.md)** donde detallamos:

- Flujo de trabajo con Git.
- Arquitectura de 4 capas.
- Estándares de código y commits.

---

## 📋 Estructura del Proyecto

```text
src/
├── config/          # Configuración de conexión
├── constants/       # Constantes de roles y rutas
├── controllers/     # Controladores (Orquestación HTTP)
├── database/        # Capa de datos (Consultas SQL)
├── helpers/         # Respuestas estandarizadas y errores
├── mappers/         # Transformadores de datos (DB -> JS)
├── middlewares/     # Middlewares (auth, validate, error)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio (Core)
└── validators/      # Esquemas de validación
init/                # Scripts SQL para la base de datos
tests/               # Tests automáticos
```

---

## ✅ Estándares de Entrega

- **Respuestas**: Todas las respuestas de la API son consistentes: `{ success: true, data: { ... } }`.
- **Validación**: Ningún dato entra a la base de datos sin ser validado previamente.
- **Borrado**: Se utiliza borrado lógico (`activo = 0`).

---

Proyecto académico — Facultad de Ciencias de la Administración – UNER · 2026
