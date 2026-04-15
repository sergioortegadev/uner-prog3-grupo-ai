import fs from 'fs';
import multer from 'multer';
import { errorResponse } from '../helpers/response.helper.js';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Ruta ${req.originalUrl} no encontrada`, ERROR_CODES.NOT_FOUND);
};

/**
 * Manejador de errores global
 */
export const globalErrorHandler = (err, req, res, _next) => {
  // CLEANUP: Si hubo un error y Multer ya había guardado un archivo, lo borramos (Garbage Collection)
  if (req?.file?.path) {
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupErr) {
      console.error(
        'Error al intentar borrar el archivo huérfano (globalErrorHandler):',
        cleanupErr.message,
      );
    }
  }

  // 1. Error de Multer (carga de archivos)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(
        res,
        'El archivo excede el límite de 5MB',
        ERROR_CODES.PAYLOAD_TOO_LARGE,
      );
    }
    return errorResponse(res, err.message, ERROR_CODES.BAD_REQUEST);
  }

  // 2. Si es un error operacional (AppError o tiene el flag), respondemos con sus datos
  if (err instanceof AppError || err.isOperational) {
    return errorResponse(
      res,
      err.message,
      {
        code: err.code,
        status: err.status,
      },
      err.details || [],
    );
  }

  // 3. Si llegamos acá, es un BUG (Programming Error) o error no controlado
  console.error('ERROR NO CONTROLADO:', err);

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  // En desarrollo mostramos el stack trace para debuguear mejor
  const details = process.env.NODE_ENV === 'development' ? { stack: err.stack } : [];

  return errorResponse(res, message, { code: 'INTERNAL_ERROR', status }, details);
};
