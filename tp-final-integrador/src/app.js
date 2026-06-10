import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';
import validateContentType from './middlewares/content.middleware.js';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Middlewares base
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
    optionsSuccessStatus: 200,
  }),
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
  const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'logs', 'access.log'), {
    flags: 'a',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
}

app.use(validateContentType);
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Documentación de la API (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Enrutamiento  (API)
app.use(apiRouter);

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador de errores global
app.use(globalErrorHandler);

export { app };
