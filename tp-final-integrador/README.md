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

- **Arquitectura**: Modular por dominio de 4 capas.
- **Seguridad**: Autenticación con JWT y autorización por Roles.
- **Base de Datos**: MySQL con soporte para Transacciones y Stored Procedures.
- **Calidad**: Validaciones con `express-validator`, logs con `Morgan` y borrado lógico (Soft Delete).
- **Documentación**: API documentada con Swagger (proximamente).

---

## 🚀 Guía de Inicio

### 1. Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

### 2. Base de Datos

- **Opción A (XAMPP/Manual)**: Importar el archivo `init/schema.sql` en tu servidor MySQL.
- **Opción B (Docker)**: `npm run infra:up` (Levanta MySQL y phpMyAdmin automáticamente).

### 3. Ejecución

```bash
npm run dev # Inicia el servidor con auto-reload
```

---

## 🛠️ Desarrollo de Funcionalidades

Para mantener la calidad y el orden en el equipo, seguimos una **Arquitectura de 4 Capas**. Cada nuevo módulo debe incluir:

1. **Modelo**: `*.model.js` (Consultas SQL).
2. **Servicio**: `*.service.js` (Lógica de negocio).
3. **Validador**: `*.validator.js` (Esquemas de validación).
4. **Controlador**: `*.controller.js` (Orquestador HTTP).
5. **Rutas**: `*.routes.js` (Definición de endpoints).

> [!IMPORTANT]
> Lee la [Guía de Arquitectura Detallada](./docs/ARCHITECTURE.md) para entender el flujo de datos.

---

## 📋 Estructura del Proyecto

```text
src/
├── config/          # Configuración de conexión
├── helpers/         # Respuestas estandarizadas
├── middlewares/     # Middlewares (auth, validate, error)
└── modules/         # Dominios de negocio (Código principal)
init/                # Scripts SQL para la base de datos
tests/               # Tests automáticos (opcionales)
```

---

## ✅ Estándares de Entrega

- **Respuestas**: Todas las respuestas de la API son consistentes: `{ success: true, data: { ... } }`.
- **Validación**: Ningún dato entra a la base de datos sin ser validado previamente.
- **Borrado**: Se utiliza borrado lógico (`activo = 0`).

---

Proyecto académico — Facultad de Ciencias de la Administración – UNER · 2026
