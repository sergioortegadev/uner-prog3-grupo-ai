import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'usuarios');

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return cb(
      new AppError(
        ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,
        `Tipo de archivo no permitido. Solo se permiten: ${allowedExts.join(', ')}`,
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
