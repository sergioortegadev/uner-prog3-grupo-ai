// Ejercicio 1 d

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const DATA_PATH = join(process.cwd(), "data", "characters.json");
const DATA_PATH_SUM = join(process.cwd(), "data", "summary.json");

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
 * @param {string} [path] - Ruta opcional (por defecto usa DATA_PATH)
 * @throws {NodeJS.ErrnoException} Si el archivo no existe o hay error de permisos
 * @throws {SyntaxError} Si el JSON está mal formado
 * @returns {Promise<Array<Object>>} array de objetos
 */
export const readJsonData = async (path = DATA_PATH) => {
  try {
    const content = await readFile(path, "utf-8");
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

export const readJsonDataSummary = async (path = DATA_PATH_SUM) => {
  try {
    const content = await readFile(path, "utf-8");
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
 * @param {string} [path] - Ruta opcional (por defecto usa DATA_PATH)
 * @throws {NodeJS.ErrnoException} Si hay error de permisos
 */
export const writeJsonData = async (data, path = DATA_PATH) => {
  // Crear el directorio si no existe
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
};

export const writeJsonDataSummary = async (data, path = DATA_PATH_SUM) => {
  // Crear el directorio si no existe
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
};

export { DATA_PATH, DATA_PATH_SUM };
