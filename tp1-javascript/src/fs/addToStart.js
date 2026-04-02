import { readJsonData, writeJsonData } from "../utils/fileHandler.js";

export const addToStart = async (character1, character2) => {
  const characters = await readJsonData();

  if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

  let id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
  const newCharacter1 = { id, ...character1 };
  id++;
  const newCharacter2 = { id, ...character2 };
  characters.unshift(newCharacter1);
  characters.unshift(newCharacter2);
  await writeJsonData(characters);
  console.log(`\nEjercicio 2 b\nPersonajes con ids ${id - 1} y ${id} agregados al inicio`);
};
