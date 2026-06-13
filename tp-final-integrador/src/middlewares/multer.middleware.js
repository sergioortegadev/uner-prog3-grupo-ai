import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

export const getUploadsDir = () =>
  process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads', 'usuarios');

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadsDir();
    // Asegurarse de que el directorio exista
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIMETYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new AppError(
        ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,
        `Tipo de archivo no permitido. Solo se permiten: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
