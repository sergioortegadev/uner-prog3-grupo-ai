# Trabajo Práctico JavaScript

> Trabajo Práctico — Programación III  
> Consumo de API REST, manipulación de File System y gestión de datos JSON con Node.js

---

## 👥 Grupo AI

| # | Nombre y Apellido |
|---|-------------------|
| 1 | Belardita Horacio Daniel |
| 2 | Berón Tomás Manuel |
| 3 | Leiva Enzo |
| 4 | Ortega Sergio |
| 5 | Sandoval Edgardo |         

---

## 📋 Descripción del Proyecto

Aplicación de consola en **Node.js** que interactúa con la [Thrones API](https://thronesapi.com/) para obtener, crear y persistir información de personajes. Incluye operaciones de lectura y escritura sobre el sistema de archivos local usando el módulo nativo `fs/promises`.

---

## 🛠️ Tecnologías

- **Node.js** v18+ (nativo, sin dependencias externas)
- **`fetch`** nativo (Node 18+)
- **`fs/promises`** para operaciones de archivo
- **ES Modules** (`import/export`)

---

## 📁 Estructura del Proyecto

```
tp1/
├── data/
│   └── characters.json          
├── src/
│   ├── api/
│   │   ├── getAllCharacters.js
│   │   ├── getCharacterById.js
│   │   └── createCharacter.js
│   ├── fs/
│   │   ├── addToEnd.js
│   │   ├── addToStart.js
│   │   ├── removeFirst.js
│   │   ├── createSummaryFile.js
│   │   └── sortByName.js
│   └── utils/
│       └── fileHandler.js
├── .gitignore
├── package.json
├── main.js
└── README.md
```

---

## ⚙️ Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/sergioortegadev/uner-prog3-grupo-ai.git

# 2. Ingresar al directorio
cd tp1-javascript

# 3. Ejecutar (no requiere npm install)
node main.js
```

> **Requisito:** Node.js versión 18 o superior.  
> Verificar con: `node --version`

---

## 🚀 Funcionalidades

### Parte 1 — API Fetch

| Función | Descripción |
|---------|-------------|
| `getAllCharacters()` | Obtiene todos los personajes y los persiste en `characters.json` |
| `getCharacterById(id)` | Busca un personaje por ID |
| `createCharacter(data)` | Agrega un nuevo personaje vía POST |

### Parte 2 — File System

| Función | Descripción |
|---------|-------------|
| `addToEnd(character)` | Agrega un personaje al final del JSON |
| `addToStart(char1, char2)` | Agrega dos personajes al inicio del JSON |
| `removeFirst()` | Elimina el primer personaje y lo muestra en consola |
| `createSummaryFile()` | Crea `summary.json` solo con `id` y `fullName` |
| `sortByName()` | Ordena por nombre de forma decreciente y muestra en consola |

---


## 📡 API de referencia

Base URL: `https://thronesapi.com/api/v2/Characters`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/Characters` | Todos los personajes |
| GET | `/Characters/{id}` | Personaje por ID |
| POST | `/Characters` | Crear personaje |

---

## 📄 Licencia

Proyecto académico — Programación III · 2026