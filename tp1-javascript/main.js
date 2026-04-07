import { writeJsonData } from "./src/utils/fileHandler.js";
import { createCharacter, getCharacterById, getAllCharacters } from "./src/api/index.js";
import { addToEnd } from "./src/fs/addToEnd.js";
import { addToStart } from "./src/fs/addToStart.js";
import { removeFirst } from "./src/fs/removeFirst.js";
import { createSummaryFile } from "./src/fs/createSummaryFile.js";
import { sortByName } from "./src/fs/sortByName.js";

const newCharacter1 = {
  firstName: "Pepe",
  lastName: "Argento",
  fullName: "Pepe Argento",
  title: "Casados con hijos",
  family: "Argentos",
  image: "pepe.jpg",
  imageUrl: "https://picsum.photos/200/300",
};

const newCharacter2 = {
  firstName: "Roberto",
  lastName: "Perez",
  fullName: "Roberto perez",
  title: "medico",
  family: "Hospital",
  image: "jon.jpg",
  imageUrl: "https://picsum.photos/200/300",
};
const newCharacter3 = {
  firstName: "Flor",
  lastName: "Martinez",
  fullName: "Flor Martinez",
  title: "Medico",
  family: "Hospital",
  image: "jon.jpg",
  imageUrl: "https://picsum.photos/200/300",
};

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
