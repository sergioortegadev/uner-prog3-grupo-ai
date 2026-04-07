import { writeJsonData } from "./src/utils/fileHandler.js";
import { createCharacter, getCharacterById, getAllCharacters } from "./src/api/index.js";
import {
  addToEnd,
  addToStart,
  removeFirst,
  createSummaryFile,
  sortByName,
} from "./src/fs/index.js";
import { newCharacter1, newCharacter2, newCharacter3 } from "./src/data/mockCharacters.js";

const main = async () => {
  try {
    console.log("\n===== PARTE 1: API =====");
    // a) Recuperar la información de todos los personajes (GET)
    const { data: characters } = await getAllCharacters();
    // d) y persistirla en un archivo JSON.
    await writeJsonData(characters);
    // b) Agregar un nuevo personaje (POST).
    await createCharacter(newCharacter1);
    // c) Buscar la información de un determinado personaje, utilizando un "id" como parámetro GET
    await getCharacterById(3);

    console.log("\n===== PARTE 2: ARCHIVOS =====");
    // a) Agregar un personaje al final del archivo.
    await addToEnd(newCharacter1);

    // b) Agregar dos personajes al inicio del archivo.
    await addToStart(newCharacter2, newCharacter3);

    // c) eliminar primer personaje
    await removeFirst();

    // d) Crear sumary con id y nombres
    await createSummaryFile();

    // e) Ordenar por nombre en Summary
    await sortByName();

    console.log("\n===== FINAL TP1 =====\n");
  } catch (error) {
    // Centralizamos todos los errores aquí
    console.error("\n❌ ERROR CRÍTICO EN LA EJECUCIÓN:");
    console.error(`Mensaje: ${error.message}`);
  }
};

main();
