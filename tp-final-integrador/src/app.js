import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import { obrasSocialesRouter as obrasSocialesRoutes } from './modules/obras_sociales/obras_sociales.routes.js';
import { especialidadesRouter as especialidadesRoutes } from './modules/especialidades/especialidades.routes.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';
import { UPLOAD_CONFIG } from './config/upload.config.js';

const uploadsDir = UPLOAD_CONFIG.STORAGE_DEST;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middlewares base
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  }),
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static('public'));

// Prefijo de las rutas
const API_PREFIX = '/api/v1';

// Rutas de la aplicación (Modulares)
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/usuarios`, usuariosRoutes);
app.use(`${API_PREFIX}/obras-sociales`, obrasSocialesRoutes);
app.use(`${API_PREFIX}/especialidades`, especialidadesRoutes);

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador de errores global (incluye manejo de errores de Multer)
app.use(globalErrorHandler);

export { app };
