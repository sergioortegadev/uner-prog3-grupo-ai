import { readJsonData, writeJsonData } from "../utils/fileHandler.js";

export const addToStart = async (character2, character3) => {
  try {
    const characters = await readJsonData();

    if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

    let id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
    const newCharacter2 = { id, ...character2 };
    id++;
    const newCharacter3 = { id, ...character3 };
    characters.unshift(newCharacter2);
    characters.unshift(newCharacter3);
    await writeJsonData(characters);
    console.log(`\nEjercicio 2 b\nPersonajes con ids ${id - 1} y ${id} agregados al inicio`);
  } catch (error) {
    console.error("Error en addToStart:", error.message);
    throw error;
  }
};
