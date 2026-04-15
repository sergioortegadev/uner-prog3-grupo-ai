import multer from 'multer';
import path from 'path';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';
import { UPLOAD_CONFIG } from '../config/upload.config.js';

/**
 * Configuración de storage para Multer.
 * Guarda archivos en el destino configurado con nombre único.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_CONFIG.STORAGE_DEST);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * Filtro de archivos: acepta solo imágenes permitidas.
 */
const fileFilter = (req, file, cb) => {
  if (!UPLOAD_CONFIG.ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(
      new AppError(
        ERROR_CODES.BAD_REQUEST,
        'Tipo de archivo inválido. Solo se permiten imágenes JPEG, PNG, GIF o WebP',
      ),
    );
  }
  cb(null, true);
};

/**
 * Middleware para subir foto de usuario.
 * Límite configurado en UPLOAD_CONFIG.
 */
export const uploadFotoUsuario = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
}).single('foto');
