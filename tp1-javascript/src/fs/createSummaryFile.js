import { readJsonData, writeJsonDataSummary } from "../utils/fileHandler.js";

export const createSummary = async () => {
  try {
    const characters = await readJsonData();

    if (characters.length === 0) throw new Error("Error: Archivo sin ningún personaje");

    let newCharacters = [];

    for (let el of characters) {
      let element = {
        id: el.id,
        fullName: el.fullName,
      };
      newCharacters.push(element);
    }

    await writeJsonDataSummary(newCharacters);
    console.log(`\nEjercicio 2 d\nPersonajes con ids y nombres guardados en nuevo archivo Summary`);
  } catch (error) {
    console.error("Error en createSummary:", error.message);
    throw error;
  }
};
