import { readJsonData, writeJsonData } from "../utils/fileHandler.js";

export const removeFirst = async () => {
  try {
    const characters = await readJsonData();
    const characterDeleted = characters.shift();
    const id = characterDeleted.id;
    await writeJsonData(characters);
    console.log(`\nEjercicio 2 c\nPersonaje con id ${id} eliminado del comienzo\n`);
    console.log(characterDeleted);
  } catch (error) {
    console.error("Error en removeFirst:", error.message);
    throw error;
  }
};
