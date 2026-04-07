import { readJsonData, writeJsonData } from "../utils/fileHandler.js";
import { isValidCharacter } from "../utils/validators.js";

export const addToEnd = async (character) => {
  if (!isValidCharacter(character)) {
    throw new Error("Datos de personaje inválidos para agregar al final (faltan campos obligatorios).");
  }

  const characters = await readJsonData();
  const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
  const newCharacter = { id, ...character };
  characters.push(newCharacter);
  await writeJsonData(characters);
  console.log(`\nEjercicio 2 a\nPersonaje con id ${id} agregado al final`);
};
