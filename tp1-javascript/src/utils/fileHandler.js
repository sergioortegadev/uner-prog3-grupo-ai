// Utilidades de lectura/escritura de archivos JSON

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const DATA_PATH = join(process.cwd(), "data", "characters.json");
const SUMMARY_DATA_PATH = join(process.cwd(), "data", "summary.json");

export const fileHandler = (response, method) => {
  const { status, statusText, data } = response;

  // Escribimos todos los datos en un archivo JSON
  writeData(data)
    .then(() => {
      console.log("\nArchivo escrito correctamente\nRespuesta del servidor:");
      console.log("Status code: ", status, " Status Text: ", statusText, "\n");
    })
    .catch((error) => {
      console.error("\nError al escribir el archivo: ", error);
    });
};

/**
 * @param {string} [filePath] - Ruta opcional (por defecto usa DATA_PATH)
 * @throws {NodeJS.ErrnoException} Si el archivo no existe o hay error de permisos
 * @throws {SyntaxError} Si el JSON está mal formado
 * @returns {Promise<Array<Object>>} array de objetos
 */
export const readJsonData = async (filePath = DATA_PATH) => {
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    // Validar que sea un array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      // Archivo no existe, retornar array vacío
      return [];
    }
    throw error;
  }
};

export const readJsonDataSummary = async (filePath = SUMMARY_DATA_PATH) => {
  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    // Validar que sea un array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      // Archivo no existe, retornar array vacío
      return [];
    }
    throw error;
  }
};

/**
 * @param {Array<Object>} data a guardar
 * @param {string} [filePath] - Ruta opcional (por defecto usa DATA_PATH)
 * @throws {NodeJS.ErrnoException} Si hay error de permisos
 */
export const writeJsonData = async (data, filePath = DATA_PATH) => {
  // Crear el directorio si no existe
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

export const writeJsonDataSummary = async (data, filePath = SUMMARY_DATA_PATH) => {
  // Crear el directorio si no existe
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

export { DATA_PATH, SUMMARY_DATA_PATH };
