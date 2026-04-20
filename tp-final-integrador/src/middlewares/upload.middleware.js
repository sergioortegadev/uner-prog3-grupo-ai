import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';
import { UPLOAD_CONFIG } from '../config/upload.config.js';

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

/**
 * Configuración de storage para Multer.
 * Guarda archivos en el destino configurado con nombre único y extensión segura.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_CONFIG.STORAGE_DEST);
  },
  filename: (req, file, cb) => {
    // Para mayor seguridad, forzamos la extensión basada en el mimetype validado,
    // ignorando la extensión original proporcionada por el cliente.
    const ext = MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase();

    // Sanitizamos el nombre base para evitar caracteres extraños y convertimos a minúsculas
    const baseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
}).single('foto');

/**
 * Middleware para subir foto de usuario con validaciones adicionales.
 */
export const uploadFotoUsuario = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return next(err);

    // Validación de archivo vacío (0 bytes)
    if (req.file && req.file.size === 0) {
      // Borramos el archivo vacío para no ensuciar el disco
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new AppError(ERROR_CODES.BAD_REQUEST, 'El archivo subido está vacío.'));
    }

    next();
  });
};
