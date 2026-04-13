import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './modules/health/health.routes.js';
import { obrasSocialesRouter as obrasSocialesRoutes } from './modules/obras_sociales/obras_sociales.routes.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';

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
app.use(`${API_PREFIX}/obras-sociales`, obrasSocialesRoutes);

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador de errores global
app.use(globalErrorHandler);

export { app };
