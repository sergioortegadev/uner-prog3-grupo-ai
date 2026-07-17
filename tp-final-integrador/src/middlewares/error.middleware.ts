import { errorResponse } from '../helpers/response.helper.ts';
import { ERROR_CODES, AppError } from '../helpers/errors.helper.ts';
import { deleteUploadedFile } from '../helpers/url.helper.ts';

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res) => {
  return errorResponse({
    res,
    errorType: ERROR_CODES.NOT_FOUND,
    message: `Ruta ${req.originalUrl} no encontrada`,
  });
};

/**
 * Manejador de errores global
 */
export const globalErrorHandler = async (err, req, res, _next) => {
  // Limpieza automática de archivos huérfanos si ocurrió un error
  try {
    const filesToDelete = req.file
      ? [req.file]
      : req.files
        ? Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat()
        : [];

    if (filesToDelete.length > 0) {
      await Promise.allSettled(filesToDelete.map((f) => deleteUploadedFile(f.path)));
    }
  } catch (unlinkError) {
    console.error('Error al eliminar archivo huérfano en globalErrorHandler:', unlinkError);
  }

  // 1. Si es un error operacional (AppError o tiene el flag), respondemos con sus datos
  if (err instanceof AppError || err.isOperational) {
    return errorResponse({
      res,
      errorType: {
        code: err.code,
        status: err.status,
      },
      message: err.message,
      details: err.details || [],
    });
  }

  // 2. Errores de sintaxis de JSON (específicos de express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse({
      res,
      errorType: ERROR_CODES.BAD_REQUEST,
      message: 'El cuerpo de la petición (JSON) tiene un formato inválido',
      details: process.env.NODE_ENV === 'development' ? [{ error: err.message }] : [],
    });
  }

  // 3. Errores de Multer (campos no permitidos, tamaño de archivo excedido, etc.)
  if (err.name === 'MulterError') {
    let message = 'Error en la subida de archivos';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `El campo '${err.field}' no es válido. Verifique el nombre del campo esperado para este archivo.`;
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse({
        res,
        errorType: ERROR_CODES.PAYLOAD_TOO_LARGE,
        message: 'El archivo es demasiado grande',
      });
    }
    return errorResponse({
      res,
      errorType: ERROR_CODES.BAD_REQUEST,
      message,
    });
  }

  if (err.message === 'Unexpected end of form') {
    return errorResponse({
      res,
      errorType: ERROR_CODES.BAD_REQUEST,
      message: 'La subida del archivo fue interrumpida abruptamente. Por favor, intente de nuevo.',
    });
  }
  // 4. Manejo de errores de base de datos (como duplicados)
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse({
      res,
      errorType: ERROR_CODES.DUPLICATE_ENTRY,
      details: process.env.NODE_ENV === 'development' ? [{ sqlMessage: err.sqlMessage }] : [],
    });
  }

  // 5. BUG (Programming Error) o error no controlado
  console.error('ERROR NO CONTROLADO:', err);

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;

  // En desarrollo mostramos el stack trace para debuguear mejor
  const details = process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : [];

  return errorResponse({
    res,
    errorType: { code: 'INTERNAL_ERROR', status },
    message,
    details,
  });
};
