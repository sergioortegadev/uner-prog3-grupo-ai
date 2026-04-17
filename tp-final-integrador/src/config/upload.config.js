import path from 'path';

/**
 * Configuración centralizada para la subida de archivos.
 */
export const UPLOAD_CONFIG = {
  // Ruta física absoluta donde se guardan los archivos
  STORAGE_DEST: path.join(process.cwd(), 'public', 'uploads', 'usuarios'),

  // Prefijo de URL para acceder a los archivos desde el cliente
  URL_PREFIX: '/uploads/usuarios',

  // Límite de tamaño de archivo (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  // Tipos MIME permitidos
  ALLOWED_MIMES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};
