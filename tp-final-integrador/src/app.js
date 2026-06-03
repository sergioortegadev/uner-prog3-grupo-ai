import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';
import validateContentType from './middlewares/content.middleware.js';

const app = express();

// Middlewares base
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
    optionsSuccessStatus: 200,
  }),
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(validateContentType);
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Enrutamiento  (API)
app.use(apiRouter);

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejador de errores global
app.use(globalErrorHandler);

export { app };
