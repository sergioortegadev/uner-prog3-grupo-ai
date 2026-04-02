import { writeJsonData } from "./src/utils/fileHandler.js";
import { guardarPersonaje, obtenerPersonajePorId, obtenerPersonajes } from "./src/api/index.js";
import { addToEnd } from "./src/fs/addToEnd.js";
import { addToStart } from "./src/fs/addToStart.js";
import { removeFirst } from "./src/fs/removeFirst.js";
import { createSummary } from "./src/fs/createSummaryFile.js";
import { sortByName } from "./src/fs/sortByName.js";

const nuevoPersonaje1 = {
  firstName: "Pepe",
  lastName: "Argento",
  fullName: "Pepe Argento",
  title: "Casados con hijos",
  family: "Argentos",
  image: "pepe.jpg",
  imageUrl: "https://picsum.photos/200/300",
};

const nuevoPersonaje2 = {
  firstName: "Roberto",
  lastName: "Perez",
  fullName: "Roberto perez",
  title: "medico",
  family: "Hospital",
  image: "jon.jpg",
  imageUrl: "https://picsum.photos/200/300",
};
const nuevoPersonaje3 = {
  firstName: "Flor",
  lastName: "Martinez",
  fullName: "Flor Martinez",
  title: "Medico",
  family: "Hospital",
  image: "jon.jpg",
  imageUrl: "https://picsum.photos/200/300",
};

const main = async () => {
  console.log("\n===== PARTE 1: API =====");
  try {
    // a) Recuperar la información de todos los personajes (GET)
    const { data: personajes } = await obtenerPersonajes();
    // d) y persistirla en un archivo JSON.
    await writeJsonData(personajes);
    // b) Agregar un nuevo personaje (POST).
    await guardarPersonaje();
    // c) Buscar la información de un determinado personaje, utilizando un "id" como parámetro GET
    await obtenerPersonajePorId(3);
  } catch (err) {
    console.error("Error en Parte 1:", err.message);
  }

  console.log("\n===== PARTE 2: ARCHIVOS =====");
  try {
    // a) Agregar un personaje al final del archivo.
    await addToEnd(nuevoPersonaje1);

    // b) Agregar dos personajes al inicio del archivo.
    await addToStart(nuevoPersonaje2, nuevoPersonaje3);

    // c) eliminar primer personaje
    await removeFirst();

    // d) Crear sumary con id y nombres
    await createSummary();

    // e) Ordenar por nombre en Summary
    await sortByName();

    console.log("\n===== FINAL TP1 =====\n");
  } catch (error) {
    console.error("Error en Parte 2:", error.message);
  }
};

main();
