import { readJsonData, writeJsonData } from "../utils/fileHandler.js";

export const addToEnd = async (character) => {
  const characters = await readJsonData();

  if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

  const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
  const newCharacter = { id, ...character };
  characters.push(newCharacter);
  await writeJsonData(characters);
  console.log(`\nEjercicio 2 a\nPersonaje con id ${id} agregado al final`);
};
