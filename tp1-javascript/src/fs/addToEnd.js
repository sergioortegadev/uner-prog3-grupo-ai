import { readJsonData, writeJsonData } from "../utils/fileHandler.js";

export const addToEnd = async (character) => {
  try {
    const characters = await readJsonData();

    if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

    const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
    const newCharacter = { id, ...character };
    // await writeJsonData([...characters, newCharacter]);
    characters.push(newCharacter);
    await writeJsonData(characters);
    console.log(`\nEjercicio 2 a\nPersonaje con id ${id} agregado al final`);
  } catch (error) {
    console.error("Error en addToEnd:", error.message);
    throw error;
  }
};
