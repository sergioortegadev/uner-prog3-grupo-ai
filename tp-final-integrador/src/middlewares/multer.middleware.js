import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError, ERROR_CODES } from '../helpers/errors.helper.js';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'usuarios');

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({ storage });

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|webp/;
  const mimetype = fileTypes.test(file.mimetype); //
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) { 
    return cb(null, true);
  }
  cb(new AppError(
          ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,
          `Tipo de archivo no permitido. Solo se permiten: ${fileTypes}`,
        ),
        false,
      );
};

export const uploadImage = multer({ 
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE }, 
  fileFilter: fileFilter
});