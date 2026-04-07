import { readJsonData, writeJsonData } from "../utils/fileHandler.js";
import { isValidCharacter } from "../utils/validators.js";

export const addToStart = async (character1, character2) => {
  if (!isValidCharacter(character1) || !isValidCharacter(character2)) {
    throw new Error("Datos de personajes inválidos para agregar al inicio (faltan campos obligatorios).");
  }

  const characters = await readJsonData();


  const baseId = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;
  const newCharacter1 = { id: baseId, ...character1 };
  const newCharacter2 = { id: baseId + 1, ...character2 };
  characters.unshift(newCharacter1);
  characters.unshift(newCharacter2);
  await writeJsonData(characters);
  console.log(`\nEjercicio 2 b\nPersonajes con ids ${newCharacter1.id} y ${newCharacter2.id} agregados al inicio`);
};
