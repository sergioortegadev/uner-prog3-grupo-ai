// Ejercicio 1 d

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const DATA_PATH = join(process.cwd(), 'data', 'characters.json');
export const fileHandler = (response, method) => {

    const {status, statusText, data} = response

    switch (method) {
        case 'GET':
            // Escribimos todos los datos en un archivo JSON
            writeData(data).then(() => {
                console.log("\nArchivo escrito correctamente\nRespuesta del servidor:");
                console.log("Status code: ", status, " Status Text: ", statusText, "\n");    
            }).catch((error) => {
                console.error("\nError al escribir el archivo: ", error);
            }) 
            break;

        default:
            break;
    }
}

/**
 * @throws {NodeJS.ErrnoException} Si el archivo no existe o hay error de permisos
 * @throws {SyntaxError} Si el JSON está mal formado
 * @returns {Promise<Array<Object>>} array de objetos
 */
export const readData = async () => {
    try {
        const content = await readFile(DATA_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        // Validar que sea un array
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Archivo no existe, retornar array vacío
            return [];
        }
        throw error;
    }
};

/**
 * @param {Array<Object>} data a guardar
 * @throws {NodeJS.ErrnoException} Si hay error de permisos
 */
export const writeData = async (data) => {
    // Crear el directorio si no existe
    await mkdir(dirname(DATA_PATH), { recursive: true });
    await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

export { DATA_PATH };