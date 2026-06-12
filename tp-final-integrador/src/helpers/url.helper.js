import path from 'node:path';

/**
 * Convierte una ruta de archivo del sistema en una URL pública absoluta para el cliente.
 * Evita exponer rutas internas del servidor e incluye el host/puerto para acceso directo.
 *
 * @param {string} filePath - Ruta completa del archivo en el sistema de archivos.
 * @param {string} publicDir - Directorio público base (ej: '/uploads/usuarios').
 * @returns {string|null} URL pública absoluta o null si el filePath es inválido.
 */
export const toPublicUrl = (filePath, publicDir = '/uploads/usuarios') => {
  if (!filePath) return null;

  // Obtenemos la base de la URL desde las variables de entorno o usamos localhost por defecto
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = process.env.PORT || 3000;
  const baseUrl = process.env.APP_URL || `${protocol}://localhost:${port}`;

  // Extraemos solo el nombre del archivo
  const fileName = path.basename(filePath);

  const cleanPublicDir = publicDir.startsWith('/') ? publicDir : `/${publicDir}`;

  return `${baseUrl}${cleanPublicDir}/${fileName}`;
};
