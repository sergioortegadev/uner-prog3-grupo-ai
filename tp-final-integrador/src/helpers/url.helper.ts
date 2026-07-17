import path from 'node:path';
import fs from 'node:fs/promises';

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

  try {
    const url = new URL(baseUrl);
    url.pathname = path.posix.join(url.pathname, cleanPublicDir, fileName);
    return url.toString();
  } catch {
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPublicDir}/${fileName}`;
  }
};

/**
 * Elimina un archivo del sistema de archivos, ignorando errores de tipo ENOENT.
 * Es seguro de llamar incluso si el archivo ya no existe.
 *
 * @param {string} filenameOrPath - Nombre base del archivo o ruta completa.
 * @param {string} [uploadsDir] - Opcional. Ruta al directorio si se pasó solo el nombre.
 */
export const deleteUploadedFile = async (filenameOrPath, uploadsDir) => {
  if (!filenameOrPath) return;
  try {
    const filePath = uploadsDir ? path.join(uploadsDir, filenameOrPath) : filenameOrPath;
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};
